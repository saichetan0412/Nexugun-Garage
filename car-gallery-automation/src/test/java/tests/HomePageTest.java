package tests;

import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.JavascriptExecutor;
import org.testng.Assert;
import org.testng.annotations.*;
import pages.HomePage;
import com.aventstack.extentreports.*;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;

public class HomePageTest {
    private WebDriver driver;
    private HomePage homePage;
    private static final String BASE_URL = "https://saichetan0412.github.io/Nexugun-Garage/";
    private static ExtentReports extent;
    private static ExtentTest test;

    @BeforeClass
    public void setUp() throws InterruptedException{
        ExtentSparkReporter spark = new ExtentSparkReporter("test-output/ExtentReport.html");
        extent = new ExtentReports();
        extent.attachReporter(spark);    
        System.setProperty("webdriver.chrome.driver", "chromedriver.exe");
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        homePage = new HomePage(driver);
        homePage.openUrl(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("document.body.style.zoom='75%'");
        Thread.sleep(4000); 
    }

    @Test(groups = {"smoke", "sanity", "regression"})
    public void testWebpageIsAvailable() {
        test = extent.createTest("testWebpageIsAvailable");
        //Step 1: Take screenshot after loading
        homePage.takeScreenshot("screenshots/webpage_loaded.png");
        // Step 3: Verify the page is online by checking the main header is present
        Assert.assertTrue(homePage.isMainHeaderPresent(), "Main header is not present. Webpage might not be available.");
        test.info("Opened the webpage.");
        test.pass("Main header is present. Webpage is available.");
    }

    @Test(groups = {"smoke"}, priority = 2, enabled = false)
    public void testPageTitleValidation() {
        test = extent.createTest("testPageTitleValidation");
        // Step 1: Get the title and compare with main header
        String pageTitle = driver.getTitle();
        String mainHeader = homePage.getMainHeaderText();
        System.out.println("Page Title: " + pageTitle);
        test.info("Page Title: " + pageTitle);
        test.info("Main Header: " + mainHeader);
        Assert.assertEquals(pageTitle, mainHeader, "Page title and main header do not match!");
        // Step 3: Hover over the Title icon and check for spinning logo
        boolean isSpinning = homePage.hoverOverLogoAndCheckSpin();
        Assert.assertTrue(isSpinning, "Logo did not spin on hover.");
        test.pass("Logo spins on hover over the title icon.");
    }

    @Test(groups = {"smoke", "sanity", "regression"})
    public void testCarSearchBar() throws InterruptedException {
        test = extent.createTest("testCarSearchBar");
        // Get total car cards before search
        int totalCarCards = homePage.getVisibleCarCardCount();
        // Step 1: Enter less than 4 characters, expect all cars to be visible
        /*homePage.enterSearchText("Au");
        Thread.sleep(1000); // Wait for UI update
        int cardCountShort = homePage.getVisibleCarCardCount();
        test.info("Entered less than 4 characters. Visible car cards: " + cardCountShort);
        Assert.assertEquals(cardCountShort, totalCarCards, "All car cards should be visible for less than 4 characters."); */
        // Step 2: Enter a valid car name (4+ chars) that exists
        homePage.enterSearchText("Sian");
        Thread.sleep(1000); // Wait for UI update
        int cardCountAudi = homePage.getVisibleCarCardCount();
        test.info("Entered 'Audi'. Visible car cards: " + cardCountAudi);
        Assert.assertTrue(cardCountAudi > 0 && cardCountAudi < totalCarCards, "Filtered car card(s) should appear for 'Lamborghini'.");
        // Step 3: Enter a car name that does not exist
        homePage.enterSearchText("XYZQ");
        Thread.sleep(1000); // Wait for UI update
        int cardCountNone = homePage.getVisibleCarCardCount();
        test.info("Entered 'XYZQ'. Visible car cards: " + cardCountNone);
        Assert.assertEquals(cardCountNone, 0, "No car cards should appear for a non-existent car.");
        test.pass("Car search bar validation passed for all scenarios.");
}

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            //driver.quit();       
        }
        extent.flush();
    }
}

