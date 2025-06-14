import { combineReducers, createStore } from "redux";

const initialAccount = {
  balance: 0,
  loan: 0,
  purpose: "",
};

function accountReducer(state = initialAccount, action) {
  switch (action.type) {
    case "account/deposit":
      return { ...state, balance: state.balance + action.payload };
    case "account/withdraw":
      return { ...state, balance: state.balance - action.payload };
    case "account/requestLoan": {
      if (state.loan > 0) return state;
      return {
        ...state,
        loan: action.payload.loan,
        purpose: action.payload.purpose,
        balance: state.balance + action.payload.loan,
      };
    }
    case "account/payLoan": {
      return {
        ...state,
        balance: state.balance - state.loan,
        loan: 0,
        purpose: "",
      };
    }
    default:
      return state;
  }
}

const initialCustomer = {
  name: "",
  ssn: "",
  dateCreated: "",
};

const customerReducer = (state = initialCustomer, action) => {
  switch (action.type) {
    case "customer/create": {
      return {
        ...state,
        name: action.payload.name,
        ssn: action.payload.ssn,
        createdAt: action.payload.createdAt,
      };
    }
    case "customer/editName": {
      return { ...state, name: action.payload.name };
    }
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  account: accountReducer,
  customer: customerReducer,
});

const store = createStore(rootReducer);

//example without action creator, the whole object is passed in
store.dispatch({ type: "account/deposit", payload: 1 });

//examples using the action creator pattern
store.dispatch(deposit(100));
store.dispatch(requestLoan(500, "to buy some shoes"));
store.dispatch(withdraw(50));
store.dispatch(payLoan());

//action creators : get passed into the store.dispatch instead of the objects themselves
function deposit(amount: number) {
  return { type: "account/deposit", payload: amount };
}

function withdraw(amount: number) {
  return { type: "account/withdraw", payload: amount };
}

function requestLoan(amount: number, reason: string) {
  return {
    type: "account/requestLoan",
    payload: {
      loan: amount,
      purpose: reason,
    },
  };
}

function payLoan() {
  return { type: "account/payLoan" };
}

function createCustomer(name: string, ssn: string) {
  return {
    type: "customer/create",
    payload: { name, ssn, createdAt: new Date().toISOString() },
  };
}

function updateName(name: string) {
  return {
    type: "customer/editName",
    payload: { name },
  };
}

store.dispatch(createCustomer("Perry Yeung", "12345"));

console.log(store.getState());

store.dispatch(updateName("Peter Parker"));

console.log(store.getState());
