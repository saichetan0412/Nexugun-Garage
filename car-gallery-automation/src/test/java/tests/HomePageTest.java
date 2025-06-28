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
    public void setUp() {
        ExtentSparkReporter spark = new ExtentSparkReporter("test-output/ExtentReport.html");
        extent = new ExtentReports();
        extent.attachReporter(spark);    
        System.setProperty("webdriver.chrome.driver", "chromedriver.exe");
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        homePage = new HomePage(driver);
    }

    @Test(groups = {"smoke", "sanity", "regression"})
    public void testWebpageIsAvailable() throws InterruptedException{
        test = extent.createTest("testWebpageIsAvailable");
        //Step 1: Open the webpage
        homePage.openUrl(BASE_URL);
        ((JavascriptExecutor) driver).executeScript("document.body.style.zoom='75%'");
        //Step 2: Take screenshot after loading
        Thread.sleep(4000);
        homePage.takeScreenshot("screenshots/webpage_loaded.png");
        // Step 3: Verify the page is online by checking the main header is present
        Assert.assertTrue(homePage.isMainHeaderPresent(), "Main header is not present. Webpage might not be available.");
        test.info("Opened the webpage.");
        test.pass("Main header is present. Webpage is available.");
    }

    @AfterClass
    public void tearDown() {
        if (driver != null) {
            //driver.quit();       
        }
        extent.flush();
    }
}

