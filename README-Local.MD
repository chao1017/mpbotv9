# MP Bot

## 先決條件
- 安裝 [Node.js][1] 10.14 以上版本。
    ```bash
    # 查看 node 版本
    node --version
    ```

---

# 在本機運行 Bot
- 安裝 modules 
    在cmd中輸入以下指令。
    ```bash
    npm install
    ```
- 運行 Bot
    在cmd中輸入以下指令。
    ```bash
    npm start
    ```
    PS:以上指令執行時，需要在 Bot 資料夾。

---

# 使用 Bot模擬器 進行測試
- 安裝 [Bot模擬器][2] 4.3.0 以上版本

## 使用 Bot模擬器 連接 Bot
- 啟動Bot模擬器
![1](/images/L1.jpg)
- 點擊 Open Bot
![2](/images/L2.jpg)
- 於 Bot URL 欄位中輸入 `http://localhost:3978/api/messages`
![3](/images/L3.jpg)
- 點擊 Connect
![4](/images/L4.jpg)
- 連接 Bot 完成
![5](/images/L5.jpg)

---

[1]: https://nodejs.org
[2]: https://github.com/Microsoft/BotFramework-Emulator/releases