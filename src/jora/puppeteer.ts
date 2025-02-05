import puppeteer, {
  type Browser,
  type Page,
  type ElementHandle,
} from "puppeteer";

interface AccountData {
  generatedEmail: string;
  password: string;
}

class JoraAccountManager {
  private browser: Browser;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async waitForElement(
    page: Page,
    selector: string,
    timeout = 30000
  ): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.error(`Element not found: ${selector}`);
      return false;
    }
  }

  async slowSendKeys(
    element: ElementHandle<Element>,
    text: string,
    delay = 100
  ): Promise<void> {
    for (const char of text) {
      await element.type(char, { delay });
    }
  }

  async register(page: Page, data: AccountData): Promise<void> {
    try {
      // Wait for email input and enter email
      const emailSelector = 'input[type="email"]';
      if (!(await this.waitForElement(page, emailSelector))) {
        throw new Error("Email input in login page not found");
      }

      const emailInput = await page.$(emailSelector);
      if (!emailInput) throw new Error("Email input element not found");
      await this.slowSendKeys(emailInput, data.generatedEmail);

      // Focus the input field
      await page.evaluate(() => {
        const element = document.querySelector(emailSelector);
        if (element instanceof HTMLElement) {
          element.click();
        }
      });

      // Wait for password input and enter password
      const passwordSelector = 'input[type="password"]';
      if (!(await this.waitForElement(page, passwordSelector))) {
        throw new Error("Password input in login page not found");
      }
      const passwordInput = await page.$(passwordSelector);
      if (!passwordInput) throw new Error("Password input element not found");
      await this.slowSendKeys(passwordInput, data.password);

      await page.evaluate(() => {
        const passwordElement = document.querySelector(passwordSelector);
        if (passwordElement instanceof HTMLElement) {
          passwordElement.click();
        }
      });

      // Wait for submit button and click it
      const submitSelector = 'button[type="submit"]';
      if (!(await this.waitForElement(page, submitSelector))) {
        throw new Error("Login submit button in login page not found");
      }
      const submitButton = await page.$(submitSelector);
      if (!submitButton) throw new Error("Submit button element not found");
      await submitButton.click();

      // Wait for page to load
      await page.waitForTimeout(5000); // Adjust PAGE_LOAD_TIME as needed
    } catch (error) {
      console.error(`Error during registration: ${(error as Error).message}`);
      throw error;
    }
  }

  async main(data: AccountData): Promise<boolean> {
    const page = await this.browser.newPage();

    try {
      await page.goto("https://au.jora.com/users/sign_up", {
        waitUntil: "networkidle2",
      });

      // Wait for initial page load
      await page.waitForTimeout(10000); // Adjust as needed

      // Perform registration
      await this.register(page, data);

      // Wait for account creation confirmation
      await page.waitForTimeout(15000); // Adjust as needed

      // Check if account is successfully created
      const profileTabSelector = "a.profile-tab.tab-link";
      const profileTabExists = await this.waitForElement(
        page,
        profileTabSelector
      );
      if (!profileTabExists) {
        console.log("Account creation failed");
        return false;
      }

      console.log("Account created successfully");
      return true;
    } catch (error) {
      console.error(`Error in main function: ${(error as Error).message}`);
      return false;
    } finally {
      await this.browser.close();
    }
  }
}
// Example usage
const main = async () => {
  const data: AccountData = {
    generatedEmail: "admin@cyberwizdev.com.ng",
    password: "1n2wd9whdih2199dqhndi",
  };

  const browser = await puppeteer.launch({ headless: false });
  const joraManager = new JoraAccountManager(browser);

  const result = await joraManager.main(data);
  console.log("Account creation result:", result);

  await browser.close();
};

export default main
