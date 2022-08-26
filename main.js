function userCard(id, userName){
    let balance = 100;
    let transactionLimit = 100;
    let historyLogs = [];
    let owner = userName;

    function recordOperation(type, value, time){
        historyLogs.push({
            operationType: type,
            credits: value,
            operationTime: time
        })
    }

    return {
        getCardInformation () {
            return {
                id, 
                balance, 
                transactionLimit, 
                historyLogs,
                owner
            };
        }, 
        putCredits (amount) {
            if (amount <=transactionLimit) {
                balance += amount;
                recordOperation('Recieved credits', amount, new Date());
            } else {
                console.warn('Exceeded limit')
            }
        },
        takeCredits (amount) {
            if (amount <=transactionLimit) {
                if (balance - amount >= 0) {
                    balance -= amount;
                    recordOperation('Taked credits', amount, new Date());
                } else {
                    console.warn('No enought money')
                }
            } else {
                console.warn('Exceeded limit')
            }
        },
        setTransactionLimit(amount) {
            if (amount >= 0) {
                transactionLimit = amount;
                recordOperation('Change transaction limit', amount, new Date());
            } else {
                console.warn('Your number is to low')
            }
        }, 
        transferCredits(amount, card) {
            const tax = 0.005;
            let transfferAmount = amount * tax + amount;
            if (transfferAmount <= balance && transfferAmount<=transactionLimit) {
                if (transfferAmount <= balance) {
                    this.takeCredits(transfferAmount);
                    card.putCredits(amount);
                } else {
                    console.warn('Not enought money')
                }
            }
        }
    }
}

class UserAccount {
    constructor(name, password) {
        this.name = name;
        this.password = password
        this.cards = [];
        this.limit = 3;
    }

    addCard() {
        if (this.cards.length < this.limit) {
            this.cards.push(userCard(this.cards.length + 1, this.name))
        } else {
            console.warn('You have more than 3 cards')
        }
    }

    getCardById(key) {
        return this.cards[key-1].getCardInformation()
    }

    logIn(name, password) {
        return name === this.name && password === this.password
    }
}

let card1 = userCard(1);

console.log(card1.getCardInformation())
card1.putCredits(50)
console.log(card1.getCardInformation())

let user = new UserAccount('Victor', 'qwerty123');
console.log(user)
user.addCard()
user.addCard()
user.addCard()
user.addCard()
console.log(user)
console.log(user.getCardById(2))
user.cards[1].takeCredits(40);
console.log(user.getCardById(2))