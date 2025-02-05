import { Builder, By, until, WebDriver, WebElement } from "selenium-webdriver";
import chrome from 'selenium-webdriver/chrome'; // Import Chrome options

const PAGE_LOAD_TIME = 5000; // Adjust as needed

interface AccountData {
  generatedEmail: string;
  password: string;
}

class JoraAccountManager {
  private browser: WebDriver;

  constructor(browser: WebDriver) {
    this.browser = browser;
  }

  async waitForElement(
    locator: By,
    timeout = 30000
  ): Promise<WebElement | null> {
    try {
      return await this.browser.wait(until.elementLocated(locator), timeout);
    } catch (error) {
      console.error(`Element not found: ${locator}`);
      return null;
    }
  }

  async slowSendKeys(
    element: WebElement,
    text: string,
    delay = 100
  ): Promise<void> {
    for (const char of text) {
      await element.sendKeys(char);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  async register(data: AccountData): Promise<void> {
    try {
      const emailEle = await this.waitForElement(
        By.xpath("//input[@type='email']")
      );
      if (!emailEle) throw new Error("Email input in login page not found");
      await this.slowSendKeys(emailEle, data.generatedEmail);

      const passwordEle = await this.waitForElement(
        By.xpath("//input[@type='password']")
      );
      if (!passwordEle)
        throw new Error("Password input in login page not found");
      await this.slowSendKeys(passwordEle, data.password);

      const submitEle = await this.waitForElement(
        By.xpath("//button[@type='submit']")
      );
      if (!submitEle)
        throw new Error("Login submit button in login page not found");

      await submitEle.click();
      await this.browser.sleep(PAGE_LOAD_TIME);
    } finally {
      await this.browser.switchTo().defaultContent();
    }
  }

  async main(data: AccountData): Promise<boolean> {
    await this.browser.get("https://au.jora.com/users/sign_up");

    await this.browser.sleep(10000); // Allow page to load

    await this.register(data);

    await this.browser.sleep(15000);

    const asideLinkEle = await this.waitForElement(
      By.xpath("//a[@class='profile-tab tab-link']")
    );
    return !!asideLinkEle;
  }
}

export const selenium = async () => {
  const options = new chrome.Options();
//   options.addArguments("--headless"); // Enables headless mode

  const browser = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const data: AccountData = {
    generatedEmail: "admin@cyberwizdev.com.ng",
    password: "1n2wd9whdih2199dqhndi",
  };

  const joraManager = new JoraAccountManager(browser);
  const result = await joraManager.main(data);
  console.log("Account creation result:", result);

  await browser.quit();
};
