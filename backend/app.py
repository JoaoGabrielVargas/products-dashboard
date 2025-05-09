import io
import csv

from flask_cors import CORS
from flask import Flask, jsonify, request, Response
from database.models import db, Category, Product, Sale
import os
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload  
import pandas as pd
from datetime import datetime  
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'database', 'database.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

UPLOAD_FOLDER = os.path.join(basedir, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

db.init_app(app)

def load_initial_data():
    try:
       
        if not Category.query.first():
            categories_path = os.path.join(basedir, 'data', 'categories.csv')
            df_categories = pd.read_csv(categories_path)
            for _, row in df_categories.iterrows():
                db.session.add(Category(id=row['id'], name=row['name']))
            products_path = os.path.join(basedir, 'data', 'products.csv')
            df_products = pd.read_csv(products_path)
            for _, row in df_products.iterrows():
                db.session.add(Product(
                    id=row['id'],
                    name=row['name'],
                    description=row['description'],
                    price=row['price'],
                    category_id=row['category_id']
                ))

            sales_path = os.path.join(basedir, 'data', 'sales.csv')
            df_sales = pd.read_csv(sales_path)
            for _, row in df_sales.iterrows():
                db.session.add(Sale(
                    id=row['id'],
                    product_id=row['product_id'],
                    quantity=row['quantity'],
                    total_price=row['total_price'],
                    date=row['date']
                ))
            
            db.session.commit()
            print("✅ Initial data loaded successfully!")
    
    except Exception as e:
        db.session.rollback()
        print(f"❌ Error loading initial data: {str(e)}")

@app.route('/hello')
def hello():
    return 'API is live!'

@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.all()

        if not categories: 
            return jsonify({"message": "No category found"}), 404
        formattedCategories = [{"id": cat.id, "name": cat.name} for cat in categories]
        return jsonify(formattedCategories)
    
    except SQLAlchemyError as e:
        
        return jsonify({"error": "Failed to access database", "details": str(e)}), 500
    
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
    

@app.route('/sales-report', methods=['GET'])
def get_sales_report():
    try:
        category_id = request.args.get('category_id')
       
        products_query = Product.query.options(joinedload(Product.category))
        sales_query = Sale.query.options(joinedload(Sale.product))\
                             .order_by(Sale.date.asc())
        
        if category_id and category_id != 'all':
            products_query = products_query.filter(Product.category_id == category_id)
            sales_query = sales_query.join(Product)\
                                   .filter(Product.category_id == category_id)
        
        products = products_query.all()
        sales = sales_query.all()
        
        total_profit = sum(
            sale.total_price
            for sale in sales if sale.product
        )
        
        product_sales = {p.id: {"quantity": 0, "revenue": 0.0} for p in products}
        for sale in sales:
            if sale.product_id in product_sales:
                product_sales[sale.product_id]["quantity"] += sale.quantity
                product_sales[sale.product_id]["revenue"] += sale.total_price
        
        products_data = [{
            "id": p.id,
            "name": p.name,
            "category": p.category.name if p.category else None,
            "price": float(p.price),
            "description": p.description,
            "total_sold": product_sales[p.id]["quantity"],
            "revenue": float(product_sales[p.id]["revenue"])
        } for p in products]
        
        sales_data = [{
            "id": s.id,
            "product_id": s.product_id,
            "product_name": s.product.name if s.product else None,
            "quantity": s.quantity,
            "unit_price": float(s.product.price) if s.product else None,
            "total_price": float(s.total_price),
            "date": s.date.isoformat() if hasattr(s.date, 'isoformat') else s.date
        } for s in sales]
        
        return jsonify({
            "meta": {
                "total_products": len(products),
                "total_sales": len(sales),
                "total_profit": float(total_profit),
                "generated_at": datetime.now().isoformat(),
                "filter_category_id": category_id
            },
            "products": products_data,
            "sales": sales_data
        })
        
    except Exception as e:
        app.logger.error(f"Error generating sales report: {str(e)}")
        return jsonify({
            "error": "Error generating sales report",
            "details": str(e) if app.debug else None
        }), 500
    


@app.route('/add-product', methods=['POST'])
def create_product():
    try:
        data = request.get_json()
        print("Data received:", data)

        session = Session(db.engine)
        category = session.get(Category, data['category_id']) 
        
        if not category:
            return jsonify({"error": f"Categoria ID {data['category_id']} don't exist"}), 404

        new_product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            category_id=int(data['category_id'])
        )
        
        db.session.add(new_product)
        db.session.commit()
        print("Product created with ID:", new_product.id)
        
        return jsonify({
            "message": "Product successfully created",
            "product": {
                "id": new_product.id,
                "name": new_product.name,
                "price": new_product.price,
                "category": category.name
            },
            "status": "success"
        }), 201

    except ValueError as e:
        db.session.rollback()
        return jsonify({"error": "Invalid data", "details": str(e), "status": "failed"}), 400
    except Exception as e:
        db.session.rollback()
        print("Erro completo:", str(e))  
        return jsonify({"error": "Error creating product", "status": "failed"}), 500
    

@app.route('/upload-csv', methods=['POST'])
def upload_products_csv():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "no files founded"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "File with empty name"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file format"}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        df = pd.read_csv(filepath)
        required_columns = ['name', 'price', 'category_id']
        
        if not all(col in df.columns for col in required_columns):
            os.remove(filepath)  
            return jsonify({
                "error": f"CSV must contain columns: {', '.join(required_columns)}"
            }), 400
        
        success_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                if not db.session.get(Category, int(row['category_id'])):
                    errors.append(f"Linha {index+1}: Category ID {row['category_id']} don't exist")
                    continue
                
                product = Product(
                    name=str(row['name']),
                    description=str(row.get('description', '')),
                    price=float(row['price']),
                    category_id=int(row['category_id'])
                )
                
                db.session.add(product)
                success_count += 1
            except Exception as e:
                errors.append(f"Line {index+1}: {str(e)}")
                continue
        
        db.session.commit()
        os.remove(filepath) 
        
        return jsonify({
            "message": f"{success_count} products imported succesfully",
            "errors": errors if errors else None
        }), 201
        
    except pd.errors.EmptyDataError:
        return jsonify({"error": "Empty CSV file"}), 400
    except Exception as e:
        db.session.rollback()
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Error proccessing: {str(e)}"}), 500
    
@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        data = request.get_json()
    
        if 'price' not in data or 'total_sold' not in data:
            return jsonify({"error": "Price and total_sold are required"}), 400
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404
        
        product.price = float(data['price'])
        product.total_sold = int(data['total_sold'])
        product.revenue = product.price * product.total_sold
        
        db.session.commit()
        
        return jsonify({
            "message": "Product updated successfully",
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "total_sold": product.total_sold,
                "revenue": product.revenue
            }
        })
        
    except ValueError as e:
        return jsonify({"error": "Invalid numeric value"}), 400
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error updating product: {str(e)}")
        return jsonify({
            "error": "Failed to update product",
            "details": str(e) if app.debug else None
        }), 500
    
@app.route('/sales/monthly/<string:month_key>', methods=['PUT'])
def update_monthly_sales(month_key):
    try:
        data = request.get_json()
        
        if 'quantity' not in data or 'price' not in data:
            return jsonify({"error": "Quantity and price are required"}), 400
        
        year, month = map(int, month_key.split('-'))
        
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        sales = Sale.query.filter(
            Sale.date >= start_date,
            Sale.date < end_date
        ).all()
        
        for sale in sales:
            sale.quantity = int(data['quantity']) / len(sales)  
            sale.total_price = float(data['price']) * sale.quantity
        
        db.session.commit()
        
        return jsonify({
            "message": "Monthly sales updated successfully",
            "month": month_key,
            "quantity": data['quantity'],
            "price": data['price']
        })
        
    except ValueError as e:
        return jsonify({"error": "Invalid data format"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route('/create-category', methods=['POST'])
def create_category():
    try:
        data = request.get_json()
        
        if not data or 'name' not in data:
            return jsonify({"error": "Category name is required"}), 400
        
        existing_category = Category.query.filter_by(name=data['name']).first()
        if existing_category:
            return jsonify({"error": "Category already exists"}), 400
        
        new_category = Category(name=data['name'])
        db.session.add(new_category)
        db.session.commit()
        
        return jsonify({
            "message": "Category created successfully",
            "category": {
                "id": new_category.id,
                "name": new_category.name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route('/export/products', methods=['GET'])
def export_products():
    try:
        products = Product.query.options(joinedload(Product.category)).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            'ID', 'Name', 'Description', 'Price', 
            'Category', 'Total Sold', 'Revenue'
        ])
        
        for product in products:
            writer.writerow([
                product.id,
                product.name,
                product.description,
                product.price,
                product.category.name if product.category else '',
                product.category_id
            ])
        
        output.seek(0)
        
        return Response(
            output,
            mimetype="text/csv",
            headers={
                "Content-disposition": "attachment; filename=products_export.csv",
                "Content-type": "text/csv"
            }
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/export/sales', methods=['GET'])
def export_sales():
    try:
        sales = Sale.query.options(joinedload(Sale.product)).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow([
            'ID', 'Date', 'Product ID', 'Product Name',
            'Quantity', 'Unit Price', 'Total Price'
        ])
        
        for sale in sales:
            writer.writerow([
                sale.id,
                sale.date,
                sale.product_id,
                sale.product.name if sale.product else '',
                sale.quantity,
                sale.product.price if sale.product else '',
                sale.total_price
            ])
        
        output.seek(0)
        
        return Response(
            output,
            mimetype="text/csv",
            headers={
                "Content-disposition": "attachment; filename=sales_export.csv",
                "Content-type": "text/csv"
            }
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  
        load_initial_data() 
    app.run(debug=True, port=8080, host='0.0.0.0')