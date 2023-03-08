import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import env from '../../utils/env.config';
import { users, products } from '../mock_data'


type User = {
  id: number,
  account: string,
  password: string,
  name: string,
  birthday: string
}

type Product = {
  id: number,
  name: string,
  price: number,
  category: string,
  description: string,
  membership: number,
  main_image: string,
  sub_images: string[],
}

const isAuthenticated = resolverFunc => (parent: unknown, args: object, context: User): object => {  
  if (Object.keys(context).length === 0) throw new Error('Empty token');
  const result: object = resolverFunc(parent, args, context);
  return result
};

const isAuthorized = resolverFunc => (parent: unknown, args: object, context: User | null): object => {  
  const result: object = resolverFunc(parent, args, context);
  return result
};

/**
應可將上述還是改寫，定義一個function 跟resolverFunc共用

type productResolver = (_: number, args: Record<string, never>, { me }: { me: User | null })=> Product

function isAuthorized(resolverFunc: productResolver): productResolver { 
  return (...args) => {
      const result = resolverFunc(...args);
      return result
    }
}
 */

export const resolvers = {
  Query: {
    users: ()=> users,
    user: (_:unknown, { id }: User) => {
      return users.find(user => user.id === id)
    },
    products: ()=> products,
    product: isAuthorized((_: unknown, args: Record<string, never>, { me }: { me: User | null }) => {      
      /** 先假定非會員為0，會員為1；若往後需擴充VIP or even VVIP 則可將數字往上加*/
      if(!me) {
        return products.filter(products => products.membership === 0) // 非會員
      } else {
        return products.filter(products => products.membership <= 1) // 會員
      }
    }),
    me: isAuthenticated((_: unknown, args: Record<string, never>, { me }: { me: User | null }) => me),
  },
  Mutation: {
    // 模擬新增使用者
    addUser: (_: unknown, args: User) => {
      args.password = bcrypt.hashSync(args.password, env.SALT)
      // 將使用者加入users array，但未實際儲存，一旦server重啟便會消失
      users.push(args); 
      return args;
    },
    login: async(_: unknown, { account, password }: User) => {
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
