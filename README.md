# 💰 Expense Tracker App

A modern, feature-rich expense tracking mobile application built with React Native and Expo. Track your expenses, manage budgets, visualize spending patterns, and take control of your finances with ease.

![Expense Tracker](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## ✨ Features

### 📊 Dashboard
- **Spending Overview**: Get instant insights into your spending habits
- **Budget Progress**: Visualize how close you are to your budget limits
- **Category Breakdown**: See spending distribution with interactive pie charts
- **Quick Actions**: Add expenses or view transactions with one tap

### 💸 Expense Management
- **Easy Expense Entry**: Quickly add expenses with intuitive forms
- **Smart Categories**: Choose from predefined categories or create custom ones
- **Multi-Currency Support**: Track expenses in multiple currencies
- **Expense Notes**: Add details and notes to remember purchases

### 📁 Budget Tracking
- **Set Budgets**: Create budgets for different spending categories
- **Budget Alerts**: Get notified when approaching budget limits
- **Visual Progress**: Track budget usage with progress bars
- **Monthly Insights**: View budget performance over time

### 📱 Transaction History
- **Complete History**: View all your transactions in one place
- **Filter & Search**: Find transactions by date, category, or amount
- **Quick Edit**: Modify or delete transactions easily
- **Export Data**: Export transactions to CSV for further analysis

### 📈 Reports & Analytics
- **Spending Trends**: Track your spending patterns over time
- **Category Analysis**: Deep dive into category-wise spending
- **Visual Charts**: Beautiful charts and graphs for data visualization
- **Date Ranges**: Analyze spending for custom time periods

### 🔔 Smart Notifications
- **Budget Alerts**: Receive warnings when nearing budget limits
- **Expense Reminders**: Set reminders to log expenses
- **Customizable**: Control notification preferences

### ⚙️ Settings & Personalization
- **Currency Selection**: Choose your preferred currency
- **Theme Options**: Customize app appearance
- **Data Management**: Clear data, export settings
- **Profile Settings**: Manage your preferences

## 🛠 Tech Stack

- **Frontend**: React Native
- **Framework**: Expo
- **Language**: TypeScript
- **Database**: SQLite (via Expo SQLite)
- **State Management**: React Context API
- **Navigation**: React Navigation
- **Charts**: Custom SVG-based charts
- **Icons**: Built-in icon system

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Clone the Repository
```bash
git clone https://github.com/SavioMohan1/expense-tracker.git
cd expense-tracker
```

### Install Dependencies
```bash
npm install
# or
yarn install
```

### Start the Development Server
```bash
npm start
# or
yarn start
```

### Run on Device/Simulator

#### Using Expo Go (Recommended)
1. Download Expo Go from App Store or Google Play Store
2. Scan the QR code shown in the terminal
3. The app will open in Expo Go

#### Using iOS Simulator
```bash
npm run ios
```

#### Using Android Emulator
```bash
npm run android
```

## 📱 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/300x600?text=Dashboard+Screen)

### Add Expense
![Add Expense](https://via.placeholder.com/300x600?text=Add+Expense+Screen)

### Budget Tracking
![Budgets](https://via.placeholder.com/300x600?text=Budgets+Screen)

### Reports
![Reports](https://via.placeholder.com/300x600?text=Reports+Screen)

*Note: Screenshots will be added soon*

## 🚀 Usage

### Adding an Expense
1. Tap the "+" button on the dashboard or navigate to "Add Expense"
2. Enter the expense amount
3. Select a category
4. Add a description (optional)
5. Choose a date (defaults to today)
6. Tap "Save" to add the expense

### Setting a Budget
1. Navigate to the "Budgets" tab
2. Tap "Add Budget"
3. Select a category
4. Set the budget amount
5. Choose a monthly limit
6. Tap "Save" to create the budget

### Viewing Reports
1. Go to the "Reports" tab
2. Select a date range (today, week, month, or custom)
3. View spending breakdown by category
4. Analyze trends with visual charts

### Managing Transactions
1. Navigate to the "Transactions" tab
2. View all expenses in chronological order
3. Tap on any transaction to see details
4. Edit or delete as needed

## 🏗 Project Structure

```
expense-tracker/
├── App.tsx                    # Main app entry point
├── app.json                   # Expo configuration
├── assets/                    # Images and icons
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── expenses/         # Expense-related components
│   │   └── transactions/     # Transaction list components
│   ├── screens/              # Screen components
│   │   ├── DashboardScreen.tsx
│   │   ├── AddExpenseScreen.tsx
│   │   ├── BudgetsScreen.tsx
│   │   ├── ReportsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── TransactionsScreen.tsx
│   ├── navigation/           # Navigation configuration
│   ├── context/              # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── db/                   # Database utilities
│   ├── utils/                # Helper functions
│   ├── constants/            # App constants
│   └── types/                # TypeScript type definitions
├── package.json
└── tsconfig.json
```

## 🔧 Configuration

### Database
The app uses SQLite for local data storage. Database initialization happens automatically on first launch.

### Theme
Customize the app's appearance in `src/constants/theme.ts`.

### Categories
Modify expense categories in `src/constants/categories.ts`.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Savio Mohan**
- GitHub: [@SavioMohan1](https://github.com/SavioMohan1)
- Portfolio: [Your Portfolio URL]

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) - For providing an amazing React Native framework
- [React Native](https://reactnative.dev/) - For the powerful mobile development framework
- The open-source community

## 📞 Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Contact the author directly
- Check the [documentation](https://docs.expo.dev/)

---

**Made with ❤️ using React Native & Expo**

⭐ **Star this repo if you find it helpful!**
