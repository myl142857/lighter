// Generated by CoffeeScript 1.4.0
(function() {
  var routes,
    _this = this;

  routes = function(app, settings) {
    var authorize, blog, category, findMostRecent, helper, parseCategory, processGetFeeds, request, util, xml2js;
    util = require('util');
    blog = (require(__dirname + '/modules/blog'))(settings);
    helper = (require(__dirname + '/modules/helper'))();
    category = (require(__dirname + '/modules/category'))(settings);
    request = (require(__dirname + '/modules/request'))(settings);
    xml2js = require('xml2js');
    authorize = function(req, res, next) {
      request.validate(req, function(result) {
        if (result !== null) {
          console.log(result);
          next();
        } else {
          res.send(401);
        }
      });
    };
    parseCategory = function(entry) {
      var cat, categories, _i, _len, _ref;
      categories = [];
      if (typeof entry.category !== 'undefined') {
        _ref = entry.category;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cat = _ref[_i];
          categories.push(cat.$.term);
        }
      }
      return categories;
    };
    app.get('/api/atom', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return res.render('atom/atom', {
        title: 'Blog entries',
        host: app.host
      });
    });
    app.get('/api/atom/categories', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return category.all(function(result) {
        return res.render('atom/categories', {
          categories: result
        });
      });
    });
    processGetFeeds = function(req, res) {
      var content;
      if (settings.feedUrl && parseInt(req.params['public']) === 1) {
        return res.redirect(settings.feedUrl);
      } else {
        res.header({
          'Content-Type': 'application/atom+xml'
        });
        content = '';
        if (req.headers['accept'] && req.headers['accept'].indexOf('text/html') >= 0) {
          content = 'encode';
        }
        return blog.find(content, function(result) {
          return res.render('atom/feeds', {
            host: app.host,
            title: result.title,
            updated: result.updated,
            posts: result.posts
          });
        });
      }
    };
    app.get('/api/atom/feeds', processGetFeeds);
    app.get('/api/atom/feeds/:public', processGetFeeds);
    app.post('/api/atom/feeds', authorize, function(req, res) {
      var parser;
      parser = new xml2js.Parser();
      return parser.parseString(req.rawBody, function(err, result) {
        return blog.create({
          posts: [
            {
              title: result.entry.title[0]._,
              body: result.entry.content[0]._,
              author: 'Mehfuz Hossain',
              categories: parseCategory(result.entry)
            }
          ]
        }, function(result) {
          var location;
          location = app.host + 'api/atom/entries/' + result._id;
          res.header({
            'Content-Type': req.headers['content-type'],
            'Location': location
          });
          res.statusCode = 201;
          return res.render('atom/entries', {
            post: result,
            host: app.host
          });
        });
      });
    });
    app.get('/api/atom/entries/:id', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return blog.findPostById(req.params.id, function(result) {
        res.header({
          'Content-Type': 'application/atom+xml'
        });
        if (req.headers['accept'] && req.headers['accept'].indexOf('text/html') >= 0) {
          result.body = helper.htmlEscape(settings.format(result.body));
        }
        return res.render('atom/entries', {
          post: result,
          host: app.host
        });
      });
    });
    app.put('/api/atom/entries/:id', authorize, function(req, res) {
      var parser;
      parser = new xml2js.Parser();
      return parser.parseString(req.rawBody, function(err, result) {
        return blog.updatePost({
          id: req.params.id,
          title: result.entry.title[0]._,
          body: result.entry.content[0]._,
          categories: parseCategory(result.entry)
        }, function(result) {
          return res.render('atom/entries', {
            post: result,
            host: app.host
          });
        });
      });
    });
    app["delete"]('/api/atom/entries/:id', authorize, function(req, res) {
      return blog.deletePost(req.params.id, function() {
        return res.end();
      });
    });
    app.get('/rsd.xml', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return res.render('rsd', {
        host: app.host,
        engine: settings.engine
      });
    });
    findMostRecent = function(callback) {
      return blog.findMostRecent(function(result) {
        callback(result);
      });
    };
    app.get('/:year/:month/:title', function(req, res) {
      var link, recent,
        _this = this;
      link = util.format("%s/%s/%s", req.params.year, req.params.month, req.params.title);
      recent = [];
      return findMostRecent(function(result) {
        recent = result;
        blog.findPost(link, function(result) {
          if (result !== null) {
            result.host = app.host;
            result.recent = recent;
            return res.render('post', result);
          } else {
            return res.end("Invalid url or could not find the post");
          }
        });
      });
    });
    return app.get('/', function(req, res) {
      var recent,
        _this = this;
      recent = [];
      return findMostRecent(function(result) {
        recent = result;
        blog.find('sanitize', function(result) {
          result.host = app.host;
          result.recent = recent;
          return res.render('index', result);
        });
      });
    });
  };

  module.exports = routes;

}).call(this);
