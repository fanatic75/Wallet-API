import { Global, Module } from '@nestjs/common';

import { MongoClient, Db } from 'mongodb';

@Global()
@Module({
  providers: [
    {
      provide: 'MONGO_PROVIDER',
      useFactory: async (): Promise<Db> => {
        try {
          console.log(process.env.MONGO_DB_URI)
          const client = await MongoClient.connect(process.env.MONGO_DB_URI);
          return client.db(process.env.MONGO_DB_NAME);
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: ['MONGO_PROVIDER'],
})
export class DbModule {}
