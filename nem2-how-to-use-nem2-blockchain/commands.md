# NEM2: How to use the NEM2 Blockchain

Following is a complete command history annexed to the article: "How to use the NEM2 Blockchain":

```bash
mkdir nem2-how-to && cd nem2-how-to

npm install -g nem2-cli

# Generate OR IMPORT your private keys
# Import command is:
# nem2-cli profile create -p PRIVATE_KEY -u http://api.beta.catapult.mijin.io:3000 --profile imp_first_account

nem2-cli account generate -n MIJIN_TEST --save -u http://api.beta.catapult.mijin.io:3000 --profile first_account
nem2-cli account generate -n MIJIN_TEST --save -u http://api.beta.catapult.mijin.io:3000 --profile second_account

# Basic health check
nem2-cli blockchain height --profile first_account

# Transfer 50 XEM from A1 to A2
nem2-cli transaction transfer --recipient SDAIUGSGF5R6O74FBSKLNIZZOIPCROFB23ELSQOY --message "Have fun!" --mosaics nem:xem::50000000 --profile first_account

# Pull Funds (5 XEM) from A1 for A2
nem2-cli transaction pullfunds --recipient SDUFICQAIHN2VYORJILRQ5YXAERLJF5HDTPJNXVR --message "Please, send me 5 XEM" --mosaic nem:xem::5000000 --profile second_account

# Co-Sign the pull transaction
nem2-cli transaction cosign --hash B4A4495E138869871F38E5643D2A4935E4140FA3205065827419024EFCD664D8 --profile first_account

# Check accounts information
nem2-cli account info --address SDUFICQAIHN2VYORJILRQ5YXAERLJF5HDTPJNXVR --profile first_account
nem2-cli account info --address SDAIUGSGF5R6O74FBSKLNIZZOIPCROFB23ELSQOY --profile second_account
```
