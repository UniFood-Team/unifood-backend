import { Injectable } from '@nestjs/common';
import { CreateReportDto, FilterReportDto } from './dto/report.dto';
import * as csv from 'csv-stringify/sync';

export interface SaleData {
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  totalValue: number;
  avgRating: number;
  saleDate: Date;
}

@Injectable()
export class ReportService {
  // Método fictício para obter dados simulados
  async getSalesReport(filter: FilterReportDto): Promise<SaleData[]> {
    // Aqui você implementaria a consulta ao banco filtrando por período, produto e vendedor
    // Exemplo básico de retorno simulado:
    return [
      {
        productId: 'p1',
        productName: 'Produto A',
        sellerId: 's1',
        sellerName: 'Vendedor X',
        quantity: 10,
        totalValue: 500,
        avgRating: 4.5,
        saleDate: new Date('2025-06-01'),
      },
      {
        productId: 'p2',
        productName: 'Produto B',
        sellerId: 's2',
        sellerName: 'Vendedor Y',
        quantity: 5,
        totalValue: 300,
        avgRating: 4.0,
        saleDate: new Date('2025-06-02'),
      },
    ];
  }

  // Gera CSV a partir dos dados
  async generateCsvReport(filter: FilterReportDto): Promise<string> {
    const sales = await this.getSalesReport(filter);

    // Monta array para CSV
    const records = sales.map((sale) => ({
      productId: sale.productId,
      productName: sale.productName,
      sellerId: sale.sellerId,
      sellerName: sale.sellerName,
      quantity: sale.quantity,
      totalValue: sale.totalValue,
      avgRating: sale.avgRating.toFixed(2),
      saleDate: sale.saleDate.toISOString().split('T')[0],
    }));

    // Define cabeçalho CSV
    const header = [
      'productId',
      'productName',
      'sellerId',
      'sellerName',
      'quantity',
      'totalValue',
      'avgRating',
      'saleDate',
    ];

    // Gera CSV string
    return csv.stringify(records, { header: true, columns: header });
  }
}
