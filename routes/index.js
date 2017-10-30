var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        companyName:            process.env.COMPANY_DISPLAY_NAME,
        webAppMetaTitle:        process.env.WEEBLY_WEB_APP_META_TITLE,
        webAppProjectName:      process.env.WEEBLY_WEB_APP_DISPLAY_PROJECT_NAME,
        webAppProjectType:      process.env.WEEBLY_WEB_APP_DISPLAY_PROJECT_TYPE,
        webAppMetaAuthor:       process.env.WEEBLY_WEB_APP_META_AUTHOR,
        webAppMetaDescription:  process.env.WEEBLY_WEB_APP_META_DESCRIPTION,
        webAppGithubUrl:        process.env.GITHUB_APP_URL
    });
});

module.exports = router;
