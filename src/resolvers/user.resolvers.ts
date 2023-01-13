import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import env from '../../utils/env.config';
import { users } from '../mock_data'

const isAuthenticated = resolverFunc => (parent, args, context) => {
  if (!context.me) throw new Error('Empty token');
  return resolverFunc.apply(null, [parent, args, context]);
};

export const resolvers = {
  Query: {
    // test
    // hello: () => 'world',
    user: (_, { id }) => {
      return users.find(user => user.id === id)
    },
    me: isAuthenticated((_, args, { me }) => me),
  },
  Mutation: {
    // 模擬新增使用者
    addUser: (_, args) => {
      args.password = bcrypt.hashSync(args.password, env.SALT)
      // 將使用者加入users array，但未實際儲存，一旦server重啟便會消失
      users.push(args); 
      return args;
    },
    login: async(_, { account, password }) => {
      const user = users.find(user => user.account === account)
      
      if (!user) {
        throw new Error('No such user found');
      } 
      const valid = await bcrypt.compare(
        password,
        user.password,
      );
      
      if (!valid) {
        throw new Error('Invalid password');
      }
      const token = jwt.sign({ id: user.id, account: user.account, password: user.password, name: user.name, birthday: user.birthday }, env.TOKEN_SECRET, { expiresIn: env.EXPIRATION });

      // 回傳定義之資料型態
      return { token }
    },
  }
};
