"use strict";

/* we didn't use maps because we are pretending that the data below is coming from a web api and whenever it comes from their it comes in the form of objects */

// data
const account1 = {
  owner: "Abdul Rafay",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2023-10-18T21:31:17.178Z",
    "2023-12-23T07:42:02.383Z",
    "2024-01-28T09:15:04.904Z",
    "2024-03-01T10:17:24.185Z",
    "2024-05-08T14:11:59.604Z",
    "2024-07-27T17:01:17.194Z",
    "2024-08-12T23:36:17.929Z",
    "2024-09-10T10:51:36.790Z",
  ],
  currency: "PKR",
  locale: "ur-PK",
};

const account2 = {
  owner: "Peter Griffin",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2023-10-01T13:15:33.035Z",
    "2023-11-30T09:48:16.867Z",
    "2023-12-25T06:04:23.907Z",
    "2024-01-25T14:18:46.235Z",
    "2024-02-05T16:33:06.386Z",
    "2024-04-10T14:43:26.374Z",
    "2024-06-25T18:49:59.371Z",
    "2024-08-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

alert("Users info\nuser: ar -- pin: 1111\nuser: pg -- pin: 2222");

/* it's a good practice to pass the data into a function instead of having a function work with a global variable, this approach is much better */

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (dateOne, dateTwo) =>
    Math.round(Math.abs(dateTwo - dateOne) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  /* const day = `${date.getDate()}`.padStart(2, 0);
  const month = `${date.getMonth() + 1}`.padStart(2, 0);
  const year = date.getFullYear();
  return `${day}/${month}/${year}`; */

  return new Intl.DateTimeFormat(locale).format(date);
};

/* instead of passing the whole account object, we only pass the data the function needs to work with to make it more independent and reusable, not dependent on the underlying data in the application, but can be used in any application */
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

/* innerHTML is a little bit similar to textContent, the difference is that innerHTML returns everything including the HTML while textContent only returns the text itself */

const displayMovements = function (acc, sort = false) {
  // to empty the entire container and then adding new elements dynamically
  // console.log(containerMovements.innerHTML);
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    /* common technique to loop two arrays at the same time by calling foreach method on just one of them (movements), and we need to convert these strings we get from date constructor into a JS object so we call methods on it */
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
        ${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    // console.log(containerMovements.innerHTML);
    /* inserting new child element right after the beginning of parent element (class=movements), all we have to do is to create a string of HTML and then we can insert that simply with the method below */
    containerMovements.insertAdjacentHTML("afterbegin", html);

    /* if we used beforeend instead of afterbegin then the order of the movements would be inverted because each new element would simply be added after the previous one at the end of the container, that's after all the child elements are already there*/
  });
};

const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, cur) => acc + cur, 0);
  // labelBalance.textContent = `${acc.balance.toFixed(2)}$`;
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const displaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const outs = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(outs), acc.locale, acc.currency);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

/* we used map method here to create a new simple array which only contains the initials of all names passed into it, then we used for each method to simply add username to objects without returning anything */

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

createUsernames(accounts);

const updateUI = function (acc) {
  displayMovements(acc);
  displayBalance(acc);
  displaySummary(acc);
};

const startLogOutTimer = function () {
  /* when we login we see the time updates after a second and before updating it shows the value we have put in manually, it happens because the entire function itself exceutes after a second, the callback function that we passed into setinterval is not executed immediately but is called after a second, so to call this function immediately is to export the callback function into a separate function then call it immediately and then also start calling it every second into setinterval function, like we have below */

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // in each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    // decrease the time by one second
    time--;
  };
  let time = 180;

  // call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

/* when we click the login button then we see a flash of LOGIN being printed then the page reloading, that's because this is the button in a form element, and in HTML the default behaviour when we click a submit button is for the page to reload, so we need to stop that from happening and for that we give the callback function an event parameter */

let currentAccount, timer;

/* fake login
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100; */

// login button
btnLogin.addEventListener("click", function (e) {
  // prevents the form from submitting
  e.preventDefault();
  // console.log("LOGIN");

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );

  // if the current account exists only then look for pin
  if (currentAccount?.pin === +inputLoginPin.value) {
    // display ui and welcome message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // creating current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      // weekday: "long",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    /* all this code can be replaced with internationalization API
    const day = `${now.getDate()}`.padStart(2, 0);
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const min = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`; */

    // clearin the input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    // display movements, balance, and summary
    updateUI(currentAccount);
  }
});

// transfer money button
btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc && // if receiver account exists
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // doing transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // creating date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // updating UI
    updateUI(currentAccount);

    /* the goal of the timer is to track the inactivity of the user, but is the user is active meaning does a transfer or request a loan, so these operations should always trigger the timer to be reset, so its an another functionality we have to give our timers */
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

/* some method here will be useful for the loan feature, lets say the bank only grants a loan if there is atleast one deposit with atleast 10% of the requested loan amount */

/* here we can cheat our algorithm by creating a large number deposits by requesting loans and then we will have increased the limit of how much loan can be granted to us by just requesting the loan, but this is just for testing purposes */

// take loan button
btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      // adding loan
      currentAccount.movements.push(amount);

      // creating loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
    }, 2500);

    clearInterval(timer);
    timer = startLogOutTimer();

    inputLoanAmount.value = "";
  }
});

// account close button
btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    // indexOf()
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );

    // delete account and hide UI
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = "";
  }
});

/* we created a state variable here which will monitor the current state of array, whether its sorted or not, and this variable will need to live outside so that its value can be preserved after clicking the button, so that each time we click the button we change the sort condition from true to false and vice versa creating a toggle effect */

let sorted = false;

// sort buttton
btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  // console.log(sorted);
  displayMovements(currentAccount, !sorted);
  // console.log(sorted);
  sorted = !sorted;
  // console.log(sorted);
});
