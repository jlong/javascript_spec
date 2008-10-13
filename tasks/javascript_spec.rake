namespace 'spec' do
  desc "Run spects for JavaScripts"
  task 'javascripts' => :environment do
    JavaScriptSpec::Runner.new do |t| 
      t.mount("/", RAILS_ROOT)
      t.mount("/spec", RAILS_ROOT+'/spec')
      t.mount('/spec/javascript/assets', RAILS_ROOT+'/vendor/plugins/javascript_spec/assets')
      
      Dir.glob('spec/javascript/*_spec.html').each do |js|
        t.run(File.basename(js,'.html').gsub(/_spec/,''))
      end
      
      t.browser(:safari)
      t.browser(:firefox)
      t.browser(:ie)
      t.browser(:konqueror)
    end
  end
end