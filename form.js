const fs = require('fs').promises;
const getCaptchaText = require('./captcha/anti-captcha');
const increaseImageSize = require('./util/image-process');
const path = require('path')

const URL = 'https://ppuponline.in/Student/RegistrationSearch.php'

// Function to submit a form
async function submitForm(browser, form) {
  let submittedpath;
  const page = await browser.newPage();
  await page.goto(URL);


  // Capture a screenshot of the CAPTCHA image element
  const captchaElement = await page.$('div.form-row.form-group img[src="../_helpers/captcha.php"]');
  const captchaImageBoundingBox = await captchaElement.boundingBox();
  const captchaImageScreenshot = await captchaElement.screenshot({
    clip: {
      x: captchaImageBoundingBox.x,
      y: captchaImageBoundingBox.y,
      width: captchaImageBoundingBox.width,
      height: captchaImageBoundingBox.height
    }
  });

  const captchaPath = path.join(__dirname, 'captcha', 'images', `${form.id}.png`)

  await increaseImageSize(captchaPath)

  // Fill out the form fields
  await page.type('input[name="RegNo"]', form.admissionID);
  await page.type('input[name="dob"]', form.dob);

  // Save the CAPTCHA image
  await fs.writeFile(captchaPath, captchaImageScreenshot, 'binary');

  const captchaValue = await getCaptchaText(form.id)


  // const captchaText = getCaptchaText(data);
  await page.type('input[name="captcha"]', captchaValue);

  // Submit the form
  await page.click('input[type="submit"]');

  // Wait for navigation to complete
  // await page.waitForNavigation();
  changedUrl = await page.url()
  console.log(changedUrl);


  if (changedUrl != 'https://ppuponline.in/Student/Registration.php') {
    submittedpath = path.join(__dirname, 'nonsubmitted', `${form.admissionID}.txt`)
    await page.waitForSelector('.alert-danger', { timeout: 10000 });
    const data = await page.$eval('div.alert-danger', element => element.textContent.trim())

    if (data == 'You are already a registered User.') {
      submittedpath = path.join(__dirname, 'submitted', `${form.admissionID}.txt`)
      fs.writeFile(submittedpath, (form.admissionID + ' | ' + data), (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          return;
        }
      })
    }else{
      submittedpath = path.join(__dirname, 'nonsubmitted', `${form.admissionID}.txt`)

      fs.writeFile(submittedpath, (form.admissionID + ' | ' + data), (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          return;
        }
      })
    }

  }

  await page.waitForSelector('#userRegistration', { timeout: 10000 });



  console.log(changedUrl);

  await page.type('input[id="mobile"]', form.mobile);
  await page.type('input[id="email"]', form.email);
  await page.type('input[id="password"]', form.passwordstring);
  await page.type('input[id="password_again"]', form.passwordstring);

  // Close the page
  // await page.close();

  await new Promise(resolve => setTimeout(resolve, 20000)); // Adjust the timeout value as needed

  // Keep the browser open
  debugger;

  // Capture a screenshot of the CAPTCHA image element
  const captchaElement2 = await page.$('img#ExampleCaptcha_CaptchaImage');
  const captchaImageBoundingBox2 = await captchaElement2.boundingBox();
  const captchaImageScreenshot2 = await captchaElement2.screenshot({
    clip: {
      x: captchaImageBoundingBox2.x,
      y: captchaImageBoundingBox2.y,
      width: captchaImageBoundingBox2.width,
      height: captchaImageBoundingBox2.height
    }
  });


  await fs.writeFile(captchaPath, captchaImageScreenshot2, 'binary');

  await increaseImageSize(captchaPath)

  const captchaValue2 = await getCaptchaText(form.id)


  await page.type('input[id="txtCaptcha"]', captchaValue2);


  await new Promise(resolve => setTimeout(resolve, 20000));

}

module.exports = submitForm