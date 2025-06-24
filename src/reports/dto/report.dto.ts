import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class FilterReportDto {
  @ApiPropertyOptional({
    description: 'Data inicial para filtro no formato ISO (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final para filtro no formato ISO (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'ID do produto para filtro' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'ID do vendedor para filtro' })
  @IsOptional()
  @IsString()
  sellerId?: string;
}

export class CreateReportDto {
  @ApiPropertyOptional({
    description: 'Data inicial para filtro no formato ISO (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final para filtro no formato ISO (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'ID do produto para filtro' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ description: 'ID do vendedor para filtro' })
  @IsOptional()
  @IsString()
  sellerId?: string;
}
