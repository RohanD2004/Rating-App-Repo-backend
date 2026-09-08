import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
  export  const sequelize = new Sequelize( process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false, // Prevents SQL logs from cluttering your console
      pool: {
        max: 20,                // Same as your 'max'
        idle: 30000,            // Same as your 'idleTimeoutMillis'
        acquire: 20000,         // Time to wait for a connection before throwing error
      },
      dialectOptions: {
        // Required if connecting to certain cloud DBs like Supabase or Render
        // ssl: {
        //   require: true,
        //   rejectUnauthorized: false,
        // },
      }
    });

    // Test connection (Equivalent to your SELECT 1 test)
   

