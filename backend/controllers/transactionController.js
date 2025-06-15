import pool from "../server/db.js";

export const deposit = async (req, res) => {
  const { depositAmount, email } = req.body;

  if (!email || typeof depositAmount !== "number") {
    res.status(400).json({ error: "Invalid input" });
  }

  try {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rowCount === 0) {
      res.json({ error: "User not found" });
    }

    const id = userResult.rows[0].id;

    await pool.query(
      "UPDATE financialinfo SET balance = balance + $1 WHERE user_id = $2 returning balance",
      [depositAmount, id],
    );

    const transaction = await pool.query(
      "INSERT INTO transactions (user_id, amount, type) VALUES ($1,$2,$3) RETURNING amount, type, created_at, transaction_id",
      [id, depositAmount, "deposit"],
    );

    res.status(200).json({
      transaction: transaction.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong with the deposit" });
  }
};

export const withdraw = async (req, res) => {
  const { email, amount } = req.body;
  try {
    const response = await pool.query("select id from users where email = $1", [
      email,
    ]);
    if (response.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
    }
    const id = response.rows[0].id;

    const fin = await pool.query(
      "update financialinfo set balance = balance - $1 where user_id = $2 returning balance",
      [amount, id],
    );
    await pool.query(
      "INSERT INTO transactions (user_id, amount, type) VALUES ($1,$2,$3)",
      [id, amount, "withdrawal"],
    );

    const updatedBalance = fin.rows[0].balance;
    res.status(200).json({
      message: "Withdrawl successful",
      updatedBalance,
    });
  } catch (error) {
    console.error(error);
  }
};
export const requestLoan = async (req, res) => {
  const { loan_amount, loan_reason, email } = req.body;
  try {
    const user = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rowCount === 0) {
      res.status(404).json({ message: "user not found" });
    }
    const id = user.rows[0].id;

    const loanQuery = await pool.query(
      "SELECT loan_amount FROM financialinfo WHERE user_id = $1",
      [id],
    );

    if (loanQuery.rows[0].loan_amount !== 0) {
      res.status(401).json({ message: "Cannot take out multiple loans" });
    }

    await pool.query(
      "UPDATE financialinfo SET loan_amount = $1, loan_reason = $2 WHERE user_id = $3",
      [+loan_amount, loan_reason, id],
    );

    await pool.query(
      "INSERT INTO transactions (user_id, amount, type ) VALUES ($1,$2,$3)",
      [id, loan_amount, "takeoutLoan"],
    );

    res.status(200).json({
      message: "Loan granted",
    });
  } catch (error) {
    console.error(error);
  }
};

export const paybackLoan = async (req, res) => {
  const { payment, email } = req.body;
  try {
    const user = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rowCount === 0) {
      res.status(404).json({ message: "user not found" });
    }
    const id = user.rows[0].id;
    await pool.query(
      "UPDATE financialinfo SET loan_amount = loan_amount - $1, balance = balance - $1 WHERE user_id = $2 RETURNING loan_amount",
      [+payment, id],
    );

    await pool.query(
      "UPDATE financialinfo SET loan_reason = CASE WHEN loan_amount = 0 THEN '' ELSE loan_reason END WHERE user_id = $1",
      [id],
    );
    await pool.query(
      "INSERT INTO transactions (user_id, amount, type) VALUES ($1,$2,$3)",
      [id, payment, "payLoan"],
    );

    res.status(200).json({ message: "loan payment recieved" });
  } catch (error) {
    console.error(error.message);
  }
};

export const transferSend = async (req, res) => {
  const { targetEmail, amount } = req.body;
  const { id } = req.user;
  if (!targetEmail || !amount || amount < 0) {
    return res.status(400).json({ message: "Invalid data supplied" });
  }
  try {
    const friendQuery = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [targetEmail],
    );
    if (!friendQuery.rows) {
      return res.status(404).json({ message: "friend not found" });
    }
    const friendID = friendQuery.rows[0].id;

    const userBalanceQuery = await pool.query(
      "SELECT balance from financialinfo WHERE user_id = $1",
      [id],
    );
    const userBalance = userBalanceQuery.rows[0]?.balance;
    if (amount > userBalance) {
      return res.status(400).json({
        message: "Transfer amount is greater than current user balance",
      });
    }
    await pool.query(
      "UPDATE financialinfo SET balance = balance - $1 WHERE user_id = $2",
      [amount, id],
    );
    await pool.query(
      "UPDATE financialinfo SET balance = balance + $1 WHERE user_id =$2 RETURNING balance",
      [amount, friendID],
    );
    await pool.query(
      "INSERT INTO transactions (user_id, recipient_id, amount, type) VALUES ($1,$2,$3,$4)",
      [id, friendID, amount, "transfer"],
    );

    res.status(200).json({ message: "Money sent successfully" });
  } catch (error) {
    console.error(error);
  }
};

export const getTransactions = async (req, res) => {
  const { id } = req.user;

  try {
    const response = await pool.query(
      "SELECT transactions.recipient_id, transactions.amount, transactions.type, transactions.created_at, transactions.transaction_id, financialinfo.account_number, financialinfo.loan_reason FROM transactions JOIN financialinfo ON transactions.user_id = financialinfo.user_id WHERE transactions.user_id = $1",
      [id],
    );

    const transactions = response.rows;
    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
  }
};

export const getTransactionInfo = async (req, res) => {
  const { transactionID } = req.params;
  console.log(transactionID);
  if (!transactionID) {
    return res.status(400).json({ message: "No transaction ID provided" });
  }

  const query1 = await pool.query(
    "SELECT type, created_at, amount, recipient_id, user_id FROM transactions WHERE transaction_id = $1",
    [transactionID],
  );
  if (query1.rowCount === 0) {
    return res
      .status(404)
      .json({ message: "No transaction found with provided ID" });
  }
  const recipientID = query1.rows[0].recipient_id;
  const recipientQuery = await pool.query(
    "SELECT users.first_name, users.last_name, financialinfo.account_number FROM users JOIN financialinfo ON users.id = financialinfo.user_id WHERE users.id = $1",
    [recipientID],
  );

  const userAccQuery = await pool.query(
    "SELECT account_number FROM financialinfo WHERE user_id = $1",
    [query1.rows[0].user_id],
  );
  if (userAccQuery.rowCount === 0) {
    return res.status(404).json({ message: "No user found" });
  }

  res.status(200).json({
    transaction: {
      transactionInfo: query1.rows[0],
      recipient: recipientQuery.rows[0],
      user: userAccQuery.rows[0],
    },
  });
};
