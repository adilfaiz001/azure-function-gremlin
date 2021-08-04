const Controller = require('../controllers/controller');

module.exports = function (context, req) {
    Controller.GetGroups().then(response => {
        context.res = {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
            body: response
        };

        context.done();
    }).catch(error => {
        context.res = {
            status: 500,
            body: error
        };

        context.done();
    })    
}