import { BadRequestException,   Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto, CreateWalletDto } from './dto/create-wallet.dto';
import { Db,  ObjectId } from 'mongodb';
import { v4 } from "uuid";
@Injectable()
export class WalletService {

  walletCollection = this.db.collection("wallet");
  constructor(@Inject('MONGO_PROVIDER') private readonly db: Db) { }

  async create(createWalletDto: CreateWalletDto) {
    const { name, balance } = createWalletDto;
    balance.toFixed(4);
    const date = new Date();
    const walletId = new ObjectId();
    const transactionId = v4();
    try {
      const doc = await this.walletCollection.insertOne({
        _id: walletId,
        name, balance, date, transactions: [{ id: transactionId, walletId, amount: balance, balance, date: new Date(), type: "CREDIT",}]
      });
      return {
        id: doc.insertedId,
        transactionId,
        balance,
        name,
        date
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
  async createTransaction(createTransaction: CreateTransactionDto, walletId: string) {
    const {  amount } = createTransaction;
    amount.toFixed(4);
    const transactionId = v4();

    const addTransactionPipeline = [
      {
        $set: {
          addedBalance: {
            $add: ["$balance", amount]
          }
        }
      },
      {
        $addFields:{
          balance:{
            $cond:{
              if:{
                $gte: ["$addedBalance",0]
              },
              then : "$addedBalance",
              else : "$balance"
            }
          }
        }
      },
      { 
        $addFields: {
        balance: {
          $round: ["$balance", 4]
        }
      }
        
      },
      {
        "$addFields": {
          "newTransactions": {
            "$concatArrays": [
              "$transactions",
              [
                {
                  balance: "$balance",
                  amount : Math.abs(amount),
                  walletId,
                  id: transactionId,
                  type: amount < 0 ? "DEBIT" : "CREDIT",
                  date: new Date()
                }
              ]
            ]
          }
        }
      },
      {
        "$addFields":{
          "transactions":{
            $cond:{
              if:{
                $gte:["$addedBalance",0]
              },
              then : "$newTransactions",
              else : "$transactions"
            }
          }
        }
      },
      {
        $unset:"addedBalance",
      },
      {
        $unset:"newTransactions"
      }
    ];
    try {
      const doc = await this.walletCollection.findOneAndUpdate({ _id: new ObjectId(walletId) }, addTransactionPipeline, { returnDocument: "before" });
      if(doc.value.balance + amount < 0)
        throw new BadRequestException("Insufficient Balance");
      return {
        balance: doc.value.balance+amount,
        transactionId,
      }
    } catch(err) {
      if(err?.message === "Insufficient Balance")
        throw err;
      throw new InternalServerErrorException();
    }

  }


  async findAllTransactions(walletId: string, skip: number, limit: number) {
    const cursor = this.walletCollection.find({ _id: new ObjectId(walletId) }).project({ "transactions": { "$slice": [skip, limit] } });
    try {
      const result = await cursor.toArray();
      if(result[0] && result[0].transactions)
      return result[0].transactions;
      throw new InternalServerErrorException();
    }
    catch {
      throw new InternalServerErrorException();
    }

  }

  async findWallet(id: string) {
    try {
      const doc = await this.walletCollection.findOne({ _id: new ObjectId(id) });
      return {
        id: doc._id,
        balance: doc.balance,
        name: doc.name,
        date: doc.date
      }
    } catch {
      throw new NotFoundException();
    }
  }

}
