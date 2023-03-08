## 實作 GraphQL API server

> 1. `login()`: 以使用者帳號及密碼進行登入並取得 JWT token
> 2. `me()`: 從 HTTP 標頭 `Authorization` 取得 JWT token 確認使用者身份後，回傳當前的使用者資料
> 3. `products()`: 取得商品清單
> 4. `product()` : 依使用者的會員身份回傳商品清單（分為一般商品與會員限定商品）

### 程式啟動方式

  - `npm install` 下載程式運作所需之modules

  - `npm start` 啟用程式

  - 於 utils folder 中建立含有以下內容之檔案 `env.config.ts` （詳細設定請詳email）

    ```
    export default {
      PORT: process.env.PORT || ,
      TOKEN_SECRET: process.env.TOKEN_SECRET || '',
      SALT: process.env.SALT || ,
      EXPIRATION: process.env.EXPIRATION || 
    }
    ```
  
  - 程式啟用後可開啟網址 [http://localhost:4000/](http://localhost:4000/) 使用GraphQL playground進行API測試

### 程式架構

  - 將架構拆分為`server`, `schema` 以及 `resolvers`，基於目前僅有user相關API而未來可能擴充之考量，故檔名以user命名
    若後續有product(舉例)之API需求，則可新增`product.schema` 以及 `product.resolvers` 便能清楚地依照檔名分門別類

  - 因未將使用者資料存入資料庫，故以 `mock_data.ts` 模擬

  - 因使用 JWT token 進行身份驗證，故將驗證所需資訊存放於 `env.config.ts`

### api 的規格與範例

  - *login()* 使用mutation，需輸入account & password 並回傳 token
    
    ```
    mutation {
      login(account: "wonderpet1@gmail.com", password: "test123")
      {
        token
      }
    }
    ```
    
    Response則分為以下三種：
    ```
    // 1. 帳號密碼皆輸入正確 -> 取得 token

    {
      "data": {
        "login": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYWNjb3VudCI6IndvbmRlcnBldDFAZ21haWwuY29tIiwicGFzc3dvcmQiOiIkMmEkMTAkbFdxeUJQOXdiVFhTZHliVktLaU90ZWRpRnRUOTVxTi9LVC82dGFXaTZoSGRSV0lhNDNlRGkiLCJuYW1lIjoiWWVuY2h1IiwiYmlydGhkYXkiOiIxOTk2LTA4LTAxIiwiaWF0IjoxNjczNjE5MTQ0LCJleHAiOjE2NzM2MjI3NDR9.8vKJI9B_c_eedizcsu_UAQVQZUpnVokJBiRoCRvMczc"
        }
      }
    }

    // 2. 帳號輸入錯誤
    "errors message": "No such user found"

    // 3. 密碼輸入錯誤
    "errors message": "Invalid password"
    ```
  - *me* 使用query，並將 token 帶入 Headers

    Headers: `Authorization` `Bearer ` + token
    ```
    query Me {
      me {
        id
        account
        password
        name
        birthday
      }
    }
    ```
    Response分為三種
    ```
    // 1. token 正確
    {
      "data": {
        "me": {
          "id": 1,
          "account": "wonderpet1@gmail.com",
          "password": "$2a$10$lWqyBP9wbTXSdybVKKiOtediFtT95qN/KT/6taWi6hHdRWIa43eDi",
          "name": "Yenchu",
          "birthday": "1996-08-01"
        }
      }
    }

    // 2. Headers 未帶 token
    "errors message": "Empty token"

    // 3. token 過期
    "errors message": "Context creation failed: Invalid token."
    ```

  - *products* 可使用 query 取得商品清單
    ```
    query Products {
      products {
        name
      }
    }
    ```

  - *product* 以header 是否帶有 jwt token 判斷使用者可瀏覽之商品品項
    ```
    query Product {
      product {
        id
        name
        price
        membership
        main_image
      }
    }
    ```
    已登入的會員才可看到 <會員限定> 商品



### 整個過程的研究心得

在過去的開發經驗中並未使用過Typescript, GraphQL 以及 apollo-server，透過這次花時間研究之後感受到以下幾點差異

- 因為TS屬強型別，且須先經過編譯才能夠執行，一旦設定好型別，在開發的過程中能立即發現傳入之參數型別或語法有誤；相較JS常常在call API的時候噴出error再回頭找問題，尤其當問題不只單一一個的時候需要花更多時間找尋錯誤源頭，TS的除錯過程更加有效率。同樣基於TS的這項特性，在開發時更需要步步為營

- 與過往使用RESTful API的經驗相比，GraphQL整體使用上彈性許多，不僅client side能夠自由地選擇每一次request所想取得的response有哪些參數外，server side在設計API時不需要定義各種API route，整體設計清楚明瞭；過往專案開發中有時不同的request需要取得相似response，RESTful API必須設計不同的routes以符合需求，而GraphQL只需要一條query或mutation便能做到，非常有助於開發效率之提升，未來個人在side-project的使用上也會考慮改以GraphQL進行開發

- 起初光是架設環境就遇到了問題，因為tsconfig設定的問題導致server若依照Apollo官網提供的example code無法順利執行，逐步辨識問題、找尋問題的解法並著手解決，我想這就是身為工程師最重要的價值與樂趣之一吧！總體而言，透過本次作業的研究收穫了更多的技術知識，不論是在官方文件的閱讀上還是在資料的找尋上，能夠在這過程中不斷地吸收和學習著實很迷人也很有趣！

