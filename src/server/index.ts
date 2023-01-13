import { ApolloServer, AuthenticationError } from 'apollo-server';
import env from '../../utils/env.config'
import jwt from 'jsonwebtoken'

// 為讀取graphql檔案
import * as path from 'path';
import * as fs from 'fs';
import { resolvers } from '../resolvers/user.resolvers';

interface MyContext {
  token?: String;
}

async function serverRun() {
  
const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, '../schema/user.schema.graphql'), 'utf8'),
  resolvers,
  context: ({ req }) => {
    let token = req.headers['authorization'];
    if (token) {
      try {
        token = token.replace("Bearer ", "");
        const me = jwt.verify(token, env.TOKEN_SECRET);
        return { me };
      } catch (e) {
        throw new AuthenticationError('Invalid token.');
      }
    }
    // 如果沒有 token 就回傳空的 context
    return {};
  }
});

const { url } = await server.listen(env.PORT);
console.log(`Server ready at ${url}`);
}
serverRun()