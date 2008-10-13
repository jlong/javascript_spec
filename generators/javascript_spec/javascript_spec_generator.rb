class JavascriptSpecGenerator < Rails::Generator::NamedBase  
  
  def manifest
    record do |m|
      m.directory File.join("spec","javascript")      
      m.template 'javascript_spec.html', File.join('spec/javascript', "#{name}_spec.html")
    end
  end
  
end