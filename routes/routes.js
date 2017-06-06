const express = require('express');
const practiceController = require('../controllers/practiceController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

router.get('/', practiceController.home);

router.get('/dashboard', 
  catchErrors(practiceController.dashboard)
);

router.get('/dashboard/page/:page', 
  authController.isLoggedIn,
  catchErrors(practiceController.dashboard)
);

router.post('/signup', 
  catchErrors(userController.createUser), 
  authController.login
);
router.get('/login', userController.login);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// API ENDPOINTS

router.post('/practices', authController.isLoggedIn, catchErrors(practiceController.createPractice));
router.put('/practices', authController.isLoggedIn, catchErrors(practiceController.updatePractice));
router.delete('/practices/:id', authController.isLoggedIn, catchErrors(practiceController.deletePractice));

router.get('/practices/chart/time', authController.isLoggedIn, catchErrors(practiceController.timeChart));
router.get('/practices/chart/tags', authController.isLoggedIn, catchErrors(practiceController.tagsChart));


module.exports = router;


/* TODOS

  DONT LOAD UNNECCESARY FRONTENDJS ON HOME PAGE (WHEN THIS IS DONE REMOVE THE CHECK FOR CANVAS DIV)

  TIDY UP WORDING CHARTS AND FORMS

  TIDY CSS CLASSES, MAKE NEW CLASS FOR STUFF WITH ","

  TIDY FRONT END JS

  DEPLOYMENT

  TESTING AND  CI 

*/


/* IMPROVEMENTS

  USE ANIMATION WITH COUNTDOWN TIMER

  USE A CALENDAR TO VIEW PAST ENTRIES

  MAKE PAGINATION AJAXIFIED

  IMPROVE STYLING FOR DELTE PRACTICE AND CLOSE LINKS ON MODAL

  FORGOT PASSOWRD LINK

*/

/* QUESTIONS

  https://daneden.github.io/animate.css/

  THE FUNCTION I'M USING TO WORK OUT THE DATE IS WRITTEN TWICE BECAUSE IT'S NEEDED BY THE TEMPLATE AND THE FRONT END JS... WHAT DO?

  IS THERE A WAY TO JUST FORWARD ALL FORM DATA VIA POST RATHER THAN GETTING ALL THE VALUES AND PUTTING THEM IN AN OBJECT
  
  IS THAT THE BEST WAY OF CREATING THE OBJECT exports.tagsChart

  how to TIDY UP TRANSITION BETWEEN CHARTS


*/