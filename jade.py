
import webapp2
from webapp2_extras import jinja2

class jadeHandler(webapp2.RequestHandler):
  
  # this class sets up the jade handler
  # http://stackoverflow.com/a/7081653/87990

  @staticmethod
  def jade_factory(app):
    j = jinja2.Jinja2(app)
    j.environment.add_extension('pyjade.ext.jinja.PyJadeExtension')
    return j
  
  @webapp2.cached_property
  def jinja2(self):
    return jinja2.get_jinja2(app=self.app, factory=jadeHandler.jade_factory)

  def render_response(self, _template, **context):
    # Renders a template and writes the result to the response.
    rv = self.jinja2.render_template(_template, **context)
    self.response.write(rv)