from flask_cors import CORS
from flask import Flask, jsonify, request
from database.models import db, Category, Product, Sale
import os
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, joinedload  
import pandas as pd
from datetime import datetime  
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
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
    """Carrega os dados iniciais dos CSVs para o banco de dados."""
    try:
        # Verifica se as tabelas já têm dados (para evitar duplicação)
        if not Category.query.first():
            # Carrega categorias
            categories_path = os.path.join(basedir, 'data', 'categories.csv')
            df_categories = pd.read_csv(categories_path)
            for _, row in df_categories.iterrows():
                db.session.add(Category(id=row['id'], name=row['name']))
            
            # Carrega produtos
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
            
            # Carrega vendas
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
            print("✅ Dados iniciais carregados com sucesso!")
    
    except Exception as e:
        db.session.rollback()
        print(f"❌ Erro ao carregar dados iniciais: {str(e)}")

@app.route('/hello')
def hello():
    return 'API is live!'

@app.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.all()

        if not categories: 
            return jsonify({"message": "Nenhuma categoria encontrada"}), 404
        formattedCategories = [{"id": cat.id, "name": cat.name} for cat in categories]
        return jsonify(formattedCategories)
    
    except SQLAlchemyError as e:
        # Erro no banco de dados (ex: tabela não existe)
        return jsonify({"error": "Falha ao acessar o banco de dados", "details": str(e)}), 500
    
    except Exception as e:
        # Erro genérico inesperado
        return jsonify({"error": "Erro interno no servidor"}), 500
    

@app.route('/sales-report', methods=['GET'])
def get_sales_report():
    try:
        products = Product.query.options(joinedload(Product.category)).all()
        sales = Sale.query.options(joinedload(Sale.product)).all()
        total_profit = sum(sale.total_price - (sale.quantity * sale.product.price)
                           for sale in sales if sale.product)
        
        products_data = [{
            "id": p.id,
            "name": p.name,
            "category": p.category.name if p.category else None,
            "price": p.price,
            "description": p.description,
            "total_sold": sum(s.quantity for s in p.sales),
            "revenue": sum(s.total_price for s in p.sales)
        } for p in products]

        sales_data = [{
            "id": s.id,
            "product_id": s.product_id,
            "product_name": s.product.name if s.product else None,
            "quantity": s.quantity,
            "unit_price": s.product.price if s.product else None,
            "total_price": s.total_price,
            "profit": s.total_price - (s.quantity * s.product.price) if s.product else None,
            "date": s.date
        } for s in sales]
        
        return jsonify({
            "meta": {
                "total_products": len(products),
                "total_sales": len(sales),
                "total_profit": total_profit,
                "generated_at": datetime.now().isoformat()
            },
            "products": products_data,
            "sales": sales_data
        })
        
    except Exception as e:
        return jsonify({
            "error": "Erro ao gerar relatório",
            "details": str(e) if app.debug else None  # Mostra detalhes apenas em debug
        }), 500
    


@app.route('/add-product', methods=['POST'])
def create_product():
    try:
        data = request.get_json()
        print("Dados recebidos:", data)

        # Forma atualizada SQLAlchemy 2.0
        session = Session(db.engine)
        category = session.get(Category, data['category_id'])  # Substitui o query.get()
        print("Categoria encontrada:", category)
        
        if not category:
            return jsonify({"error": f"Categoria ID {data['category_id']} não existe"}), 404

        new_product = Product(
            name=data['name'],
            description=data.get('description', ''),
            price=float(data['price']),
            category_id=int(data['category_id'])
        )
        
        db.session.add(new_product)
        db.session.commit()
        print("Produto criado com ID:", new_product.id)
        
        return jsonify({
            "message": "Produto criado com sucesso",
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
        return jsonify({"error": "Dados inválidos", "details": str(e), "status": "failed"}), 400
    except Exception as e:
        db.session.rollback()
        print("Erro completo:", str(e))  # Log detalhado
        return jsonify({"error": "Erro ao criar produto", "status": "failed"}), 500
    

@app.route('/upload-csv', methods=['POST'])
def upload_products_csv():
    try:
        # Verifica se o arquivo foi enviado
        if 'file' not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400
            
        file = request.files['file']
        
        # Validações do arquivo
        if file.filename == '':
            return jsonify({"error": "Nome de arquivo vazio"}), 400
            
        if not allowed_file(file.filename):
            return jsonify({"error": "Tipo de arquivo não permitido"}), 400

        # Salva o arquivo temporariamente
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Processa o CSV
        df = pd.read_csv(filepath)
        required_columns = ['name', 'price', 'category_id']
        
        # Valida o formato do CSV
        if not all(col in df.columns for col in required_columns):
            os.remove(filepath)  # Limpeza
            return jsonify({
                "error": f"CSV deve conter as colunas: {', '.join(required_columns)}"
            }), 400
        
        # Insere no banco de dados
        success_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Verifica se a categoria existe
                if not db.session.get(Category, int(row['category_id'])):
                    errors.append(f"Linha {index+1}: Categoria ID {row['category_id']} não existe")
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
                errors.append(f"Linha {index+1}: {str(e)}")
                continue
        
        db.session.commit()
        os.remove(filepath)  # Limpeza após processamento
        
        return jsonify({
            "message": f"{success_count} produtos importados com sucesso",
            "errors": errors if errors else None
        }), 201
        
    except pd.errors.EmptyDataError:
        return jsonify({"error": "Arquivo CSV vazio"}), 400
    except Exception as e:
        db.session.rollback()
        if 'filepath' in locals() and os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({"error": f"Erro no processamento: {str(e)}"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Cria as tabelas se não existirem
        load_initial_data()  # Carrega os dados automaticamente
    app.run(debug=True, port=8080, host='0.0.0.0')