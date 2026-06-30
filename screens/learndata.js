export interface Article {
    id: string;
    question: string;
    answer: string;
  }
  
  export interface Category {
    id: string;
    title: string;
    articles: Article[];
  }
  
  export const LEARN_DATA: Category[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      articles: [
        {
          id: 'diff-broker',
          question: 'How is StockLens different from a broker?',
          answer: 'StockLens is an educational and verification directory platform—we do not handle your money, hold deposits, or execute trades. Our single job is to help you analyze stock data safely and guide you directly to genuine, SEC-licensed brokerage applications.'
        },
        {
          id: 'gse-info',
          question: 'What is the GSE?',
          answer: 'The Ghana Stock Exchange (GSE) is the official public marketplace located in Accra where shares of major Ghanaian companies (like MTN Ghana, GCB Bank, Ecobank, and TotalEnergies) are legally bought and sold.\n\nWhen you buy a stock on the GSE, you own a fractional piece of that business. As the company expands and generates profits, your share value can appreciate, and they may distribute cash payments called dividends directly to you.'
        },
        {
          id: 'sec-licensed',
          question: 'What does "SEC Ghana Licensed" mean?',
          answer: 'It means a financial institution has been strictly audited, vetted, and approved by the Securities and Exchange Commission (SEC) of Ghana under the Securities Industry Act. Licensed brokers are legally mandated to safeguard investor funds, maintain transparent accounting books, and follow strict consumer protection laws.'
        },
        {
          id: 'how-to-start',
          question: 'What do I need to start investing in Ghana?',
          answer: 'To legally purchase shares on the GSE, you need three basic things:\n1. A valid national ID (Your Ghana Card is required for regulatory verification).\n2. A central securities depository (CSD) account, which your chosen broker will automatically open for you.\n3. Initial investment capital (which can often be transferred instantly via Mobile Money).'
        }
      ]
    },
    {
      id: 'glossary',
      title: 'Glossary',
      articles: [
        {
          id: 'gloss-shares',
          question: 'What are Shares / Equities?',
          answer: 'Units of ownership interest in a corporation. When you buy "shares", you become a shareholder, meaning you gain a fractional claim on the corporation’s residual assets and earnings.'
        },
        {
          id: 'gloss-dividends',
          question: 'What are Dividends?',
          answer: 'A portion of a company’s corporate earnings distributed directly to shareholders, typically on a per-share basis. If a company awards a dividend of GHS 0.10 per share and you hold 1,000 shares, you receive a direct payout of GHS 100.'
        }
      ]
    },
    {
      id: 'gse-basics',
      title: 'GSE Basics',
      articles: [
        {
          id: 'gse-hours',
          question: 'What are the trading hours of the GSE?',
          answer: 'The Ghana Stock Exchange is open for live trading session matches from Monday through Friday, opening at 9:30 AM GMT and closing at 3:00 PM GMT. It remains completely closed on weekends and official Ghanaian public holidays.'
        }
      ]
    },
    {
      id: 'scams',
      title: 'Scams',
      articles: [
        {
          id: 'scam-red-flags',
          question: 'How do I spot an investment scam?',
          answer: 'Watch out for these high-alert warning signs:\n• Guarantees of zero risk with extremely high returns (e.g., "Double your money in 48 hours").\n• Strong pressure to deposit funds immediately via personal Mobile Money numbers.\n• Platforms completely missing from the official SEC Ghana licensee directory checklist.'
        }
      ]
    }
  ];v