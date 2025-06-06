import { IsInt, Min } from 'class-validator';

export class UpdateQuantityDto {
  @IsInt()
  @Min(0)
  quantidade: number;
}
