function userCard(id){
    let balance = 100;
    let transactionLimit = 100;
    let historyLogs = [];

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
                historyLogs
            };
        }, 
        putCredits (amount) {
            if (amount <=transactionLimit) {
                balance += amount;
                recordOperation('Recieved credits', amount, new Date());
            } else {
                console.log('Exceeded limit')
            }
        },
        takeCredits (amount) {
            if (amount <=transactionLimit) {
                if (balance - amount >= 0) {
                    balance -= amount;
                    recordOperation('Taked credits', amount, new Date());
                } else {
                    console.log('No enought money')
                }
            } else {
                console.log('Exceeded limit')
            }
        },
        setTransactionLimit(amount) {
            if (amount >= 0) {
                transactionLimit = amount;
                recordOperation('Change transaction limit', amount, new Date());
            } else {
                console.log('Your number is to low')
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
                    console.log('Not enought money')
                }
            }
        }
    }
}

class UserAccount {
    constructor(name) {
        this.name = name;
        this.cards = [];
        this.limit = 3;
    }

    addCard() {
        if (this.cards.length < this.limit) {
            this.cards.push(userCard(this.cards.length + 1))
        } else {
            console.log('You have more than 3 cards')
        }
    }

    getCardById(key) {
        return this.cards[key-1].getCardInformation()
    }
}

let card1 = userCard(1);

console.log(card1.getCardInformation())
card1.putCredits(50)
console.log(card1.getCardInformation())