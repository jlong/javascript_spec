require 'spec'
require 'lib/javascript_spec'

# mock RAILS_ROOT required because of file existance check
RAILS_ROOT = File.dirname(File.expand_path(__FILE__));

describe JavaScriptSpec::Runner do
  
  def runner_for(test)
    JavaScriptSpec::Runner.new do |t| 
      t.mount("/spec", RAILS_ROOT + '/spec')
      t.mount("/spec/javascript/assets", RAILS_ROOT + '/../assets')
      t.run(test)
      t.browser(:firefox)
    end
  end
  
  it "should track successes" do
    runner_for(:success).should be_successful
  end
  
  it "should track failures" do
    runner_for(:failure).should_not be_successful
  end
  
  it "should track errors" do
    runner_for(:error).should_not be_successful
  end
  
end