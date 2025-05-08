import { Sale, MonthlySaleData } from "@/interfaces/Interfaces";

export const groupSalesByMonth = (salesData: Sale[]): MonthlySaleData[] => {
    const monthlySales: Record<string, MonthlySaleData> = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dec"];
    
    salesData.forEach((sale: Sale) => {
      const date = new Date(sale.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const yearMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const displayMonth = `${monthNames[month]}`;
      
      if (!monthlySales[yearMonthKey]) {
        monthlySales[yearMonthKey] = {
          monthKey: yearMonthKey,
          month: displayMonth,
          quantity: 0,
          total_price: 0,
          profit: 0,
          salesCount: 0
        };
      }
      
      monthlySales[yearMonthKey].quantity += sale.quantity;
      monthlySales[yearMonthKey].total_price += sale.total_price;
      monthlySales[yearMonthKey].profit += sale.profit;
      monthlySales[yearMonthKey].salesCount += 1;
    });
    
    return Object.values(monthlySales).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  };