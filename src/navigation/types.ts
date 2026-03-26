import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  AddExpense: undefined;
  Reports: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  AddExpenseModal: { prefillAmount?: number; prefillMerchant?: string } | undefined;
  BudgetsModal: undefined;
  AddCategoryModal: undefined;
};
