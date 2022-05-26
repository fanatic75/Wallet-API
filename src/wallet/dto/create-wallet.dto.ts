import { Type } from 'class-transformer';
import {  IsNotEmpty, IsNumber,  IsOptional, Min} from 'class-validator';

export class CreateWalletDto {
    @IsNumber()
    @Min(0)
    balance?:number = 0;
    @IsNotEmpty()
    name:string;

    constructor(name:string, balance:number = 0){
        this.name = name;
        this.balance = balance
    }
}


export class CreateTransactionDto{
    @IsNotEmpty()
    @IsNumber()
    amount:number;
}

export class TransactionQuery{
    
    @Type(()=>Number)
    @Min(0)
    skip?:number = 0;

    @IsNotEmpty()
    walletId:string;


    @Type(()=>Number)
    @IsOptional()
    @Min(1)
    limit?: number |  undefined;
    constructor(walletId:string,skip = 0, limit:number |undefined) {
        this.skip = skip;
        this.limit = limit;
        this.walletId = walletId;
      }
}