package pages;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.util.List;

import org.openqa.selenium.*;
import org.openqa.selenium.io.FileHandler;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

/**
 * Base Page Object for Home Page.
 * Provides common utility methods for Selenium WebDriver tests.
 */
public class HomePage {
    protected WebDriver driver;

    //--- Locators --- 
    /** Locators for Main Header */
    private static final By MAIN_HEADER = By.cssSelector(".header-main h1");
    private static final By LOGO = By.cssSelector(".header-main .header-logo");
    /** Locators for Search and Filters */
    private static final By SEARCH_BAR = By.id("searchInput");
    private static final By YEAR_INPUT = By.id("yearInput");
    private static final By YEAR_DROPDOWN = By.id("yearDropdown");
    private static final By YEAR_GRID = By.id("yearGrid");
    private static final By CLEAR_YEAR_BUTTON = By.id("clearYear");
    private static final By SORT_YEAR_FILTER = By.id("sortFilter"); 
    private static final By SORT_AZ_BUTTON = By.id("alphaSortBtn");
    /** Locators for Brand Tabs */ 
    private static final By ALL_TAB = By.cssSelector("button.tab-button[data-brand='All']");
    private static final By LAMBORGHINI_TAB = By.cssSelector("button.tab-button[data-brand='Lamborghini']");
    private static final By BUGATTI_TAB = By.cssSelector("button.tab-button[data-brand='Bugatti']");
    private static final By FERRARI_TAB = By.cssSelector("button.tab-button[data-brand='Ferrari']");
    private static final By PORSCHE_TAB = By.cssSelector("button.tab-button[data-brand='Porsche']");
    private static final By ROLLSROYCE_TAB = By.cssSelector("button.tab-button[data-brand='RollsRoyce']");
    private static final By ALL_TABS = By.cssSelector("button.tab-button"); //generic locator for all tabs
    /** Locator for Toggle Button */
    private static final By TOGGLE_VIEW_BUTTON = By.id("toggleViewBtn"); 
    /** Locators for Brand Headers and Logos */
    private static final By LAMBORGHINI_HEADER = By.cssSelector(".header-lamborghini h1");
    private static final By LAMBORGHINI_LOGO = By.cssSelector(".header-lamborghini .header-logo");
    private static final By BUGATTI_HEADER = By.cssSelector(".header-bugatti h1");
    private static final By BUGATTI_LOGO = By.cssSelector(".header-bugatti .header-logo");
    private static final By FERRARI_HEADER = By.cssSelector(".header-ferrari h1");
    private static final By FERRARI_LOGO = By.cssSelector(".header-ferrari .header-logo");
    private static final By PORSCHE_HEADER = By.cssSelector(".header-porsche h1");
    private static final By PORSCHE_LOGO = By.cssSelector(".header-porsche .header-logo");
    private static final By ROLLSROYCE_HEADER = By.cssSelector(".header-rollsroyce h1");
    private static final By ROLLSROYCE_LOGO = By.cssSelector(".header-rollsroyce .header-logo");
    /** Locator for Car Cards */
    private static final By CAR_CARDS = By.cssSelector(".car-card");


    public HomePage(WebDriver driver) {
        this.driver = driver;
    }

    /** Screenshot Method */
    public void takeScreenshot(String filePath) {
        TakesScreenshot ts = (TakesScreenshot) driver;
        File src = ts.getScreenshotAs(OutputType.FILE);
        try {
            FileHandler.copy(src, new File(filePath));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /** Wait Method - for an element to be visible */
    public WebElement waitForElementVisible(By locator, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    /** Wait Method - for an element to be clickable */
    public WebElement waitForElementClickable(By locator, int timeoutSeconds) {
        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds));
        return wait.until(ExpectedConditions.elementToBeClickable(locator));
    }

    /** Get URL - Opens the specified URL in the browser */
    public void openUrl(String url) {
        driver.get(url);
    }

    /** Get Title - Returns the current page title */
    public String getPageTitle() {
        return driver.getTitle();
    }

    /** Checks if the main header is present */
    public boolean isMainHeaderPresent() {
        return isElementPresent(MAIN_HEADER);
    }

    /** Element Presence - Checks if an element is present in the DOM */
    public boolean isElementPresent(By locator) {
        return !driver.findElements(locator).isEmpty();
    }

    /** Gets the text of the specified element */
    public String getElementText(By locator) {
        return driver.findElement(locator).getText();
    }

    /** Clicks the specified element */
    public void clickElement(By locator) {
        driver.findElement(locator).click();
    }

    /** Enters text into the specified element */
    public void enterText(By locator, String text) {
        WebElement element = driver.findElement(locator);
        element.clear();
        element.sendKeys(text);
    }

    /** Returns a list of elements matching the locator */
    public List<WebElement> getElements(By locator) {
        return driver.findElements(locator);
    }

    /** Scrolls to the specified element */
    public void scrollToElement(By locator) {
        WebElement element = driver.findElement(locator);
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView(true);", element);
    }

    /** Waits for the page to fully load */
    public void waitForPageLoad() {
        new WebDriverWait(driver, Duration.ofSeconds(30)).until(
            webDriver -> ((JavascriptExecutor) webDriver)
                .executeScript("return document.readyState").equals("complete"));
    }

    /** Checks if the specified element is displayed */
    public boolean isElementDisplayed(By locator) {
        try {
            return driver.findElement(locator).isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }

    /** Gets the value of a specified attribute from an element */
    public String getAttribute(By locator, String attribute) {
        return driver.findElement(locator).getAttribute(attribute);
    }

    /** Selects an option in a dropdown by visible text */
    public void selectDropdownByVisibleText(By locator, String text) {
        WebElement dropdown = driver.findElement(locator);
        Select select = new Select(dropdown);
        select.selectByVisibleText(text);
    }

    /** Returns the current URL */
    public String getCurrentUrl() {
        return driver.getCurrentUrl();
    }

    /** Refreshes the current page */
    public void refreshPage() {
        driver.navigate().refresh();
    }

    /** Closes the browser */
    public void closeBrowser() {
        driver.quit();
    }

    /** Returns the main header text */
    public String getMainHeaderText() {
        return driver.findElement(MAIN_HEADER).getText();
    }

    /** Hovers over the logo and checks if it spins (returns true if spinning class is present) */
    public boolean hoverOverLogoAndCheckSpin() {
        WebElement logo = driver.findElement(LOGO);
        org.openqa.selenium.interactions.Actions actions = new org.openqa.selenium.interactions.Actions(driver);
        actions.moveToElement(logo).perform();
        // Wait a moment for animation to start
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
        // Check if the logo has a spinning class (e.g., "spin" or similar)
        String classAttr = logo.getAttribute("class");
        return classAttr != null && classAttr.contains("spin");
    }

    /** Enters text into the car search bar */
    public void enterSearchText(String text) {
        WebElement searchBar = driver.findElement(SEARCH_BAR);
        searchBar.clear();
        searchBar.sendKeys(text);
    }

    /** Returns the count of visible car cards */
    public int getVisibleCarCardCount() {
        List<WebElement> cards = driver.findElements(CAR_CARDS);
        int visibleCount = 0;
        for (WebElement card : cards) {
            if (card.isDisplayed()) {
                visibleCount++;
            }
        }
        return visibleCount;
    }
}

