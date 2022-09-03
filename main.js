let database = [];
let activeAccount = {};
let x;

function setMainPage(name) {
    x = setInterval(() => {
        let date = new Date();
        date.getHours() < 10 ? $('.date__hours').text('0' + date.getHours()) : $('.date__hours').text(date.getHours())
        date.getMinutes() < 10 ? $('.date__minutes').text('0' + date.getMinutes()) : $('.date__minutes').text(date.getMinutes())
        $('.date__text').text(date.toDateString());
        if (date.getHours() >= 0 && date.getHours() < 12) {
            $('.mainPage__headline').html(`Good morning ☀, <br> ${name}`);
        } else if (date.getHours() >= 12 && date.getHours() < 18) {
            $('.mainPage__headline').html(`Good afternoon ☕, <br> ${name}`);
        } else {
            $('.mainPage__headline').html(`Good evening 🌙, <br> ${name}`);
        }
    }, 1000);
}

function userCard(id, userName) {
    let balance = 100;
    let transactionLimit = 100;
    let owner = userName;
    this.cardInformation = [];
    let historyLogs = []
    if (arguments.length >= 3) {
        balance = arguments[2].balance || 100;
        transactionLimit = arguments[2].transactionLimit || 100;
        historyLogs = arguments[2].historyLogs || [];
    }
    console.log(historyLogs)

    // function 

    return {
        historyLogs,
        recordOperation(type, value, time) {
            console.log(this);
            this.historyLogs.push({
                operationType: type,
                credits: value,
                operationTime: time
            })
        },
        getCardInformation() {
            let historyLogs = this.historyLogs
            return {
                id,
                balance,
                transactionLimit,
                historyLogs,
                owner
            };
        },
        recordCardInfo() {
            this.cardInformation = this.getCardInformation();
        },
        putCredits(amount) {
            if (amount <= transactionLimit) {
                balance += amount;
                this.recordOperation('Recieved credits', amount, new Date());
            } else {
                console.warn('Exceeded limit')
            }
            this.recordCardInfo();
        },
        takeCredits(amount) {
            if (amount <= transactionLimit) {
                if (balance - amount >= 0) {
                    balance -= amount;
                    this.recordOperation('Taked credits', amount, new Date());
                } else {
                    console.warn('No enough money')
                }
            } else {
                console.warn('Exceeded limit')
            }
            this.recordCardInfo();
        },
        setTransactionLimit(amount) {
            if (amount >= 0) {
                transactionLimit = amount;
                this.recordOperation('Change transaction limit', amount, new Date());
            } else {
                console.warn('Your number is to low')
            }
            this.recordCardInfo();
        },
        transferCredits(amount, card) {
            const tax = 0.005;
            let transfferAmount = amount * tax + amount;
            if (transfferAmount <= balance && transfferAmount <= transactionLimit) {
                if (transfferAmount <= balance) {
                    this.takeCredits(transfferAmount);
                    card.putCredits(amount);
                } else {
                    console.warn('Not enough money')
                }
            }
            this.recordCardInfo();
            card.recordCardInfo();
        }
    }
}

function UserAccount(name, password) {
    this.name = name;
    this.password = password
    this.cards = [];
    this.limit = 3;

    this.addCard = function () {
        if (this.cards.length < this.limit) {
            this.cards.push(new userCard(this.cards.length + 1, this.name))
            this.cards[this.cards.length - 1].cardInformation = this.cards[this.cards.length - 1].getCardInformation();
        } else {
            console.warn('You have more than 3 cards')
        }
    }.bind(this)

    this.getCardById = function (key) {
        return this.cards[key - 1].getCardInformation()
    }.bind(this)

    this.logIn = function (name, password) {
        return name === this.name && password === this.password
    }.bind(this)
}

function databaseConstructorFunc(dataArray) {
    let database = [];
    let dataList = dataArray;
    for (data of dataList) {
        let user = new UserAccount(data.name, data.password);
        user.limit = data.limit;
        user.cards = [];
        for (card of data.cards) {
            let theCard = new userCard(card.cardInformation.id, data.name, {
                balance: card.cardInformation.balance,
                transactionLimit: card.cardInformation.transactionLimit,
                historyLogs: card.cardInformation.historyLogs,
            });
            theCard.cardInformation = card.cardInformation;
            user.cards.push(theCard);
        }
        database.push(user);
    }
    return database;
}

database = databaseConstructorFunc(JSON.parse(localStorage.getItem('database')) || [])

$('#signIn').click(function () {
    $('.page').attr('data-hidden', 'true');
    $('.login').attr('data-hidden', 'false');
})


$('#signUp').click(function () {
    $('.page').attr('data-hidden', 'true');
    $('.register').attr('data-hidden', 'false');
})

$('#passwordSignUp').on('input', function () {
    ($('#passwordSignUp').val().length > 0 && $('#passwordSignUp').val().length < 8) ? $('.password-validate').text('Your password has less then 8 chapters'): $('.password-validate').text('');
})

$('#registerBtn').click(function () {
    let exist = false;
    if (database.length > 0) {
        for (let i = 0; i !== database.length; i++) {
            if (database[i].name = $('#nameSignUp').val()) {
                exist = true;
                console.log(database[i].name)
            }
        }
    }
    if ($('#passwordSignUp').val().length > 8) {
        if (exist) {
            let confirmLogIn = confirm(`⚠ Account with name ${$('#nameSignUp').val()} has already exist\nTo login press ok. To discard - cancel.`)
            if (confirmLogIn) {
                $('.page').attr('data-hidden', 'true');
                $('.login').attr('data-hidden', 'false');
            }
        } else {
            let userCandidature = new UserAccount($('#nameSignUp').val(), $('#passwordSignUp').val());
            userCandidature.addCard();
            database.push(userCandidature);
            localStorage.database = JSON.stringify(database)
            activeAccount = database[database.length - 1];
            activeAccount.id = database.length - 1;
            $('.page').attr('data-hidden', 'true');
            $('.mainPage').attr('data-hidden', 'false');
            clearInterval(x)
            setMainPage(userCandidature.name);
            $('#nameSignUp').val('');
            $('#passwordSignUp').val('');
            $('#loginLogin').val('');
            $('#loginPassword').val('');
        }
    }
})

$('#loginBtn').click(function () {
    let exist = false;
    let user;
    let activeId = 0;
    for (let i = 0; i !== database.length; i++) {
        if (database[i].name === $('#loginLogin').val()) {
            exist = true;
            user = database[i]
            activeId = i;
        }
    }
    if (exist) {
        if (user.password === $('#loginPassword').val()) {
            activeAccount = user;
            activeAccount.id = activeId;
            $('.page').attr('data-hidden', 'true');
            $('.mainPage').attr('data-hidden', 'false');
            clearInterval(x)
            setMainPage(user.name);
        } else {
            alert('⚠ Incorrect password! Try again')
        }
    } else {
        let confirmWindow = confirm(`⚠ Account with name ${$('#loginLogin').val()} doesn't exist\nTo sign up press ok. To discard - cancel.`)
        if (confirmWindow) {
            $('.page').attr('data-hidden', 'true');
            $('.register').attr('data-hidden', 'false');
            $('#nameSignUp').val('');
            $('#passwordSignUp').val('');
            $('#loginLogin').val('');
            $('#loginPassword').val('');
        }
    }
})

$('#logOutbtn').click(function () {
    $('.page').attr('data-hidden', 'true');
    $('.helloPage').attr('data-hidden', 'false');
})

$('#getMoneyBtn').click(function () {
    let cardId = parseInt(prompt('Input card id of card', 1));
    console.log(cardId)
    for (let i = 0; i !== database.length; i++) {
        if (database[i] === activeAccount) {
            if (cardId <= database[i].cards.length) {
                let about = database[i].getCardById(cardId);
                let amount = prompt(`Input the amount of credits to get. This card's limit is ${about.transactionLimit}`, about.transactionLimit)
                if (amount <= about.transactionLimit && about.balance - amount >= 0) {
                    database[i].cards[cardId - 1].takeCredits(parseInt(amount))
                    about = database[i].getCardById(cardId)
                    alert(`Success! Your ballance on card ${cardId} is ${about.balance}`)
                } else if (about.balance - amount < 0) {
                    alert('No enough money')
                } else {
                    alert('Exceeded limit')
                }
            } else {
                alert(`Card with id ${cardId} is not exist!`)
            }
        }
    }
    let id = activeAccount.id;
    activeAccount = database[id - 1];
    activeAccount.id = id;
    localStorage.database = JSON.stringify(database)
})

$('#putMoneyBtn').click(function () {
    let cardId = parseInt(prompt('Input card id of card', 1));
    for (let i = 0; i !== database.length; i++) {
        if (database[i] === activeAccount) {
            if (cardId <= database[i].cards.length) {
                let about = database[i].getCardById(cardId);
                let amount = prompt(`Input the amount of credits to put. This card's limit is ${about.transactionLimit}`, about.transactionLimit)
                if (amount <= about.transactionLimit) {
                    database[i].cards[cardId - 1].putCredits(parseInt(amount))
                    about = database[i].getCardById(cardId)
                    alert(`Success! Your ballance on card ${cardId} is ${about.balance}`)
                } else {
                    alert('Exceeded limit')
                }
            } else {
                alert(`Card with id ${cardId} is not exist!`)
            }
        }
    }
    let id = activeAccount.id;
    console.log(id)
    activeAccount = database[id];
    activeAccount.id = id;
    localStorage.database = JSON.stringify(database);
})

$('#transferBtn').click(function () {
    let userName = prompt(`Ok ${activeAccount.name}, input the name of user to transfer the money`, activeAccount.name);
    let finded = false;
    let foundedUser = {};
    let id = 0;
    for (user of database) {
        id++;
        if (user.name === userName) {
            finded = true;
            foundedUser = user;
            foundedUser.id = id;
        }
    }
    if (finded) {
        let cardId = parseInt(prompt(`To which ${foundedUser.name}'s card you want to transeft?\nHe(She) has got a ${foundedUser.cards.length} card(s)`, 1));
        if (cardId <= foundedUser.cards.length) {
            let usersCardId = parseInt(prompt(`From which your card you want to transeft?\nYou have got a ${activeAccount.cards.length} card(s)`, 1));
            if (usersCardId <= activeAccount.cards.length) {
                let myCard = database[activeAccount.id - 1].getCardById(cardId);
                let usersCard = database[foundedUser.id - 1].getCardById(usersCardId);
                let summa = parseInt(prompt(`Ok. You choosed ${cardId} card.\n💰How much money do you want to transfer?\nNote: your transaction limit is ${myCard.transactionLimit}`, myCard.transactionLimit))
                if (summa <= myCard.transactionLimit) {
                    if (myCard.balance - summa >= 0) {
                        database[activeAccount.id - 1].cards[usersCardId - 1].transferCredits(summa, database[foundedUser.id - 1].cards[cardId - 1]);
                        let newInfo = database[activeAccount.id - 1].cards[usersCardId - 1].getCardInformation()
                        alert(`💸 Transfer successful!\nYou send ${summa}$ to ${foundedUser.name} and your current ballance on this card is ${newInfo.balance}$`);
                    } else {
                        alert(`You haven't enough money`)
                    }
                } else {
                    alert('Exceed limit')
                }
            } else {
                alert(`You haven't got a card with ${usersCardId}`);
            }
        } else {
            alert(`${foundedUser.name} hasn't got a card with id ${cardId}`)
        }
    } else {
        alert(`User with name ${userName} is not finded! Please check the name and try again.`)
    }
    let actid = activeAccount.id;
    console.log(actid)
    activeAccount = database[actid - 1];
    activeAccount.id = actid;
    localStorage.database = JSON.stringify(database);
});

$('#historyBtn').click(function () {
    toastList[0].show();
    $('.toast-body').empty();
    for (card of activeAccount.cards) {
        let cardInfo = card.getCardInformation();
        for (historyLog of cardInfo.historyLogs) {
            let hourly = new Date(historyLog.operationTime).toTimeString().slice(0, new Date(historyLog.operationTime).toTimeString().lastIndexOf(':'))
            $('.toast-body').prepend(`<div class="text fs-5"><span class="badge text-bg-primary">${new Date(historyLog.operationTime).toDateString()}, ${hourly}</span> - ${historyLog.operationType}, ${historyLog.credits}$ on card ${cardInfo.id}</div>`)
        }
    }
})

$('#addNewCardBtn').click(function () {
    let id = activeAccount.id;
    if (database[id].cards.length < database[id].limit) {
        database[id].addCard();
        alert(`👝 Success card ${database[id].cards.length} had been added to your account`)
    } else {
        alert('You reached card-haveing limit');
    }
    activeAccount = database[id];
    activeAccount.id = id;
    localStorage.database = JSON.stringify(database);
})

$('#changeLimitBtn').click(function () {
    let cardId;
    if (activeAccount.cards.length > 1) {
        cardId = parseInt(prompt(`${activeAccount.name}, for which card you want to change transaction limit?`, 1))
    } else {
        cardId = 1
    }
    let amount = parseInt(prompt(`Amount of your new transaction limit`, 60))
    if (amount >= 0) {
        database[activeAccount.id].cards[cardId - 1].setTransactionLimit(amount);
        alert(`Well done! Now your transaction limit on card ${cardId} is ${amount}`)
    } else {
        alert('You can\'t set transaction limit as a number below zero.')
    };
    localStorage.database = JSON.stringify(database);
})

$('#checkBalanceBtn').click(function () {
    let cardId;
    if (activeAccount.cards.length > 1) {
        cardId = parseInt(prompt(`${activeAccount.name}, which card balance do you want to watch?`, 1))
    } else {
        cardId = 1
    }
    for (data of database) {
        if (data.name === activeAccount.name) {
            if (cardId <= activeAccount.cards.length) {
                let info = data.getCardById(cardId);   
                alert(`🤑 Your balance is: ${info.balance}$`)
            } else {
                alert(`😐 You haven't got a card with id ${cardId}`)
            }
        }
    }
})