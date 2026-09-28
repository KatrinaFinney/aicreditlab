// Issue-specific starting points inspired by CFPB examples of common credit-report errors.
// These are original drafts, not CFPB letter text or a promise that any item will be removed.
const entries = [
  ['wrong-name','Identity','Incorrect name','Name on credit report','Identify the name shown and the correct name.'],
  ['wrong-address','Identity','Incorrect address','Address on credit report','Identify the wrong address and the correct address.'],
  ['wrong-phone','Identity','Incorrect phone number','Phone number on credit report','Identify the wrong phone number and the correct number.'],
  ['wrong-employer','Identity','Incorrect employer','Employer information','Identify the reported employer and why it is inaccurate.'],
  ['mixed-file','Identity','Another person’s information','Mixed credit file','Identify the information that belongs to someone else and how you know.'],
  ['unfamiliar-account','Identity','Account I do not recognize','Unfamiliar account','Identify the account and explain why you believe it is not yours. If identity theft is involved, visit IdentityTheft.gov.'],
  ['owner-vs-authorized','Ownership','Authorized user listed as owner','Account ownership','Identify the account and show that you are an authorized user rather than the owner.'],
  ['joint-ownership','Ownership','Incorrect joint ownership','Joint account ownership','Identify the account and the ownership status you believe is correct.'],
  ['account-not-mine','Ownership','Account belongs to someone else','Account ownership','Identify the account and why it belongs to another person.'],
  ['wrong-creditor','Ownership','Incorrect creditor name','Creditor name','Identify the creditor shown and the correct company name.'],
  ['closed-shown-open','Account status','Closed account shown as open','Closed account status','Provide the closing date and a closing confirmation if available.'],
  ['open-shown-closed','Account status','Open account shown as closed','Open account status','Identify the account and evidence that it remains open.'],
  ['paid-shown-unpaid','Account status','Paid account shown as unpaid','Paid account status','Include a payoff statement or receipt if available.'],
  ['wrong-late-payment','Account status','Payment incorrectly shown late','Late payment status','Identify the month and include proof of timely payment if available.'],
  ['wrong-delinquency','Account status','Incorrect delinquency status','Delinquency status','Identify the status shown and your supporting payment history.'],
  ['wrong-chargeoff','Account status','Incorrect charge-off status','Charge-off status','Explain the specific status error and include relevant account records.'],
  ['wrong-collection-status','Account status','Incorrect collection status','Collection status','Explain what status is reported and the accurate status supported by records.'],
  ['wrong-last-payment-date','Dates','Incorrect last payment date','Last payment date','Compare the reported date with a dated payment record.'],
  ['wrong-open-date','Dates','Incorrect account opening date','Account opening date','Compare the reported date with an opening statement or agreement.'],
  ['wrong-first-delinquency-date','Dates','Incorrect first delinquency date','First delinquency date','Identify the reported date and explain the accurate date using records.'],
  ['wrong-close-date','Dates','Incorrect account closing date','Account closing date','Identify the date shown and the actual closing date.'],
  ['wrong-balance','Amounts','Incorrect current balance','Current account balance','Compare the reported balance with a dated statement or payoff record.'],
  ['wrong-limit','Amounts','Incorrect credit limit','Credit limit','Compare the reported limit with a statement or creditor notice.'],
  ['wrong-past-due-amount','Amounts','Incorrect past-due amount','Past-due amount','Identify the amount reported and the amount your records support.'],
  ['wrong-payment-amount','Amounts','Incorrect monthly payment amount','Monthly payment amount','Compare the reported amount with your agreement or statement.'],
  ['wrong-original-amount','Amounts','Incorrect original loan amount','Original loan amount','Compare the amount shown with your original loan agreement.'],
  ['duplicate-account','Duplicates','Same account listed twice','Duplicate account listing','Identify both entries and explain why they represent the same account.'],
  ['duplicate-collection','Duplicates','Same collection listed twice','Duplicate collection listing','Identify both collection entries and why you believe they duplicate one debt.'],
  ['unrecognized-inquiry','Inquiries','Inquiry I do not recognize','Unrecognized inquiry','Identify the inquiry and explain why you believe the record is inaccurate.'],
  ['duplicate-inquiry','Inquiries','Inquiry listed twice','Duplicate inquiry','Identify both inquiry entries and the date of the underlying application.'],
] as const;

export const letterTemplates = entries.map(([id, category, title, subject, guidance]) => ({ id, category, title, subject, guidance }));

export function letterTemplateFor(id: string) {
  return letterTemplates.find((template) => template.id === id);
}
