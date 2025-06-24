import { Controller, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportService } from './report.service';
import { FilterReportDto } from './dto/report.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get()
  @ApiOperation({ summary: 'Gerar relatório de vendas com filtros' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial no formato ISO (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final no formato ISO (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'ID do produto para filtro',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'ID do vendedor para filtro',
  })
  @ApiResponse({ status: 200, description: 'Relatório gerado com sucesso.' })
  async getReport(@Query() filter: FilterReportDto) {
    const data = await this.reportService.getSalesReport(filter);
    return { data };
  }

  @Get('export')
  @ApiOperation({ summary: 'Exportar relatório de vendas em CSV' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data inicial no formato ISO (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Data final no formato ISO (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'ID do produto para filtro',
  })
  @ApiQuery({
    name: 'sellerId',
    required: false,
    description: 'ID do vendedor para filtro',
  })
  @ApiResponse({ status: 200, description: 'CSV gerado com sucesso.' })
  async exportReport(@Query() filter: FilterReportDto, @Res() res: Response) {
    const csv = await this.reportService.generateCsvReport(filter);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="sales_report_${Date.now()}.csv"`,
    });
    res.status(HttpStatus.OK).send(csv);
  }
}
