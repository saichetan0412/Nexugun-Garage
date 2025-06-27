package pages;

import java.util.ArrayList;
import java.util.List;
import java.time.Duration;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.TimeoutException;

public class HomePage {
    private WebDriver driver;

    // Locators
    private By searchInput = By.id("searchInput");
    private By yearInput = By.id("yearInput");
    private By yearGrid = By.id("yearGrid");
    private By sortFilter = By.id("sortFilter");
    private By alphaSortBtn = By.id("alphaSortBtn");
    private By tabButtons = By.cssSelector(".tab-button");
    private By toggleViewBtn = By.id("toggleViewBtn");

    // Constructor
    public HomePage(WebDriver driver) {
        this.driver = driver;
    }

    // Open the home page
    public void open(String url) {
        driver.get(url);
    }

    public String getMainHeading() {
    return driver.findElement(By.cssSelector("h1")).getText();
    }

    // Check if at least one car card is present
    public boolean isCarCardPresent() {
        // Wait for car cards to be present before checking
        try {
            new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.presenceOfElementLocated(By.className("car-card")));
        } catch (TimeoutException e) {
            return false;
        }
        return driver.findElements(By.className("car-card")).size() > 0;
    }

    // Get the page title
    public String getTitle() {
        return driver.getTitle();
    }

    // Search for a car by name
    public void searchCar(String carName) {
        WebElement search = driver.findElement(searchInput);
        search.clear();
        search.sendKeys(carName);
        search.sendKeys(Keys.ENTER);
    }

    // Select a year from the dropdown
    public void selectYear(String year) {
        driver.findElement(yearInput).click();
        // Wait for dropdown to appear (simple sleep, replace with WebDriverWait for production)
        try { Thread.sleep(500); } catch (InterruptedException e) {}
        for (WebElement y : driver.findElement(yearGrid).findElements(By.tagName("button"))) {
            if (y.getText().equals(year)) {
                y.click();
                break;
            }
        }
    }

    // Use the sort year filter
    public void sortByYear(String order) {
        WebElement sort = driver.findElement(sortFilter);
        sort.click();
        sort.findElement(By.xpath("//option[@value='" + order + "']")).click();
    }

    // Click the alphabetical sort button
    public void clickAlphaSort() {
        driver.findElement(alphaSortBtn).click();
    }

    // Click a brand tab by visible text
    public void clickBrandTab(String brand) {
        for (WebElement tab : driver.findElements(tabButtons)) {
            if (tab.getText().trim().equalsIgnoreCase(brand)) {
                tab.click();
                break;
            }
        }
    }

    // Switch to list view
    public void switchToListView() {
        WebElement toggle = driver.findElement(toggleViewBtn);
        if (toggle.getText().toLowerCase().contains("list")) {
            toggle.click();
        }
    }

    // Switch to grid view if not already in grid view
    public void switchToGridView() {
        WebElement toggle = driver.findElement(toggleViewBtn);
        if (toggle.getText().toLowerCase().contains("grid")) {
            toggle.click();
        }
    }

    // Get the number of visible car cards
    public int getVisibleCarCardCount() {
        return driver.findElements(By.cssSelector(".car-card")).size();
    }

    // Get a list of car names currently displayed
    public List<String> getDisplayedCarNames() {
        List<String> names = new ArrayList<>();
        for (WebElement card : driver.findElements(By.cssSelector(".car-card h2"))) {
            names.add(card.getText());
        }
        return names;
    }

    // Clear the search input
    public void clearSearch() {
        driver.findElement(searchInput).clear();
    }

    // Clear the year filter (if a clear button exists)
    public void clearYearFilter() {
        WebElement clearBtn = driver.findElement(By.id("clearYear"));
        if (clearBtn.isDisplayed()) {
            clearBtn.click();
        }
    }

    // Wait for car cards to be visible (simple version)
    public void waitForCarCards() {
        new WebDriverWait(driver, Duration.ofSeconds(20))
            .until(ExpectedConditions.visibilityOfElementLocated(By.className("car-card")));
    }
}