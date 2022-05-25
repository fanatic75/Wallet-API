import { BadRequestException,  Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
    try {
      const doc = await this.walletCollection.insertOne({
        _id: walletId,
        name, balance, date, transactions: [{ id: v4(), walletId, amount: balance, balance, date: new Date(), type: "CREDIT", description: "First Transaction" }]
      });
      return {
        id: doc.insertedId,
        balance,
        name,
        date
      };
    } catch {
      throw new InternalServerErrorException();
    }
  }
  async createTransaction(createTransaction: CreateTransactionDto, walletId: string) {
    const { description, amount } = createTransaction;
    amount.toFixed(4);
    const transactionId = v4();

    const addTransactionPipeline = [
      {
        $addFields: {
          balance: {
            $add: ["$balance", amount]
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
          "transactions": {
            "$concatArrays": [
              "$transactions",
              [
                {
                  balance: "$balance",
                  amount : amount,
                  walletId,
                  id: transactionId,
                  type: amount < 0 ? "DEBIT" : "CREDIT",
                  description,
                  date: new Date()
                }
              ]
            ]
          }
        }
      },
    ];
    try {
      const doc = await this.walletCollection.findOneAndUpdate({ _id: new ObjectId(walletId) }, addTransactionPipeline, { returnDocument: "after" });
      return {
        balance: doc.value.balance.toFixed(4),
        transactionId,
      }
    } catch {
      throw new InternalServerErrorException();
    }

  }


  async findAllTransactions(walletId: string, skip: number, limit: number) {
    const cursor = this.walletCollection.find({ _id: new ObjectId(walletId) }).project({ "transactions": { "$slice": [skip, limit] } });
    try {
      const result = await cursor.toArray();
      return result;

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
