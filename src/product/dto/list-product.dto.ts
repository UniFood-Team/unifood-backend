import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ListProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  minPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  maxPrice?: string;

  @ApiPropertyOptional()
  @IsOptional()
  disponibilidade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  categorias?: string;

  @ApiPropertyOptional()
  @IsOptional()
  avaliacaoMinima?: string;
}
