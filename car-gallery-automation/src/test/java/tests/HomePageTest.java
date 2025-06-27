package tests;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.Assert;
import org.testng.annotations.*;
import pages.HomePage;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import java.io.File;
import org.apache.commons.io.FileUtils;

public class HomePageTest {
    private WebDriver driver;
    private HomePage homePage;

    private void takeScreenshot(String name) {
    try {
        File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        FileUtils.copyFile(src, new File("C:\\Users\\Sai Chetan M\\Documents\\Carrier\\NexuGun_Digital_Car_Garage\\Nexugun-Garage\\car-gallery-automation\\screenshots\\screenshot.png"));
    } catch (Exception e) {
        System.out.println("Screenshot failed: " + e.getMessage());
    }
}

    @BeforeClass
    public void setup() {
        // Set path to chromedriver if not in PATH
        System.setProperty("webdriver.chrome.driver", "chromedriver.exe");
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        homePage = new HomePage(driver);
    }

    @Test(groups = {"sanity","regression"})
    public void testHomePageLoadsAndShowsCars() {
        homePage.open("https://saichetan0412.github.io/Nexugun-Garage/");
        ((ChromeDriver) driver).executeScript("document.body.style.zoom='75%'");

        String expectedTitle = "NEXUGUNS GARAGE";
        String actualTitle = homePage.getMainHeading();
        Assert.assertEquals(actualTitle, expectedTitle, "Main heading does not match.");

        takeScreenshot("test_screenshot");
    }

    @AfterClass
    public void teardown() {
       // if (driver != null) driver.quit();
    }
}