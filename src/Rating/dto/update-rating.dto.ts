import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRatingDto {
  @ApiPropertyOptional({
    description: 'Nota da avaliação (de 1 a 5)',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Comentário opcional da avaliação',
    example: 'Produto com qualidade ainda melhor do que esperava.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
