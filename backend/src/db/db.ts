import {pool} from './pool.js';

export const connectDb = async () => {
  try {
    const client = await pool.connect();
    client.release();
  } catch (err) {
    console.error("Could not connect to database:", err);
  }
};
