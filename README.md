stages: 
-	prepare 
-	build 
-	test 
-	deploy 
-	cleanup 
 
prepare: 
  stage: prepare   script: 
-	echo "Starting the pipeline" 
-	echo "Prepare stage completed!" 
 
build: 
  stage: build   script: 
-	echo "Building the application..." 
-	echo "Hello, World! from the build stage" 


test:   
stage: test   script: 
-	echo "Running tests..." 
-	echo "Hello, World! from the test stage" 
 
deploy: 
  stage: deploy   script: 
-	echo "Deploying the application..." 
-	echo "Hello, World! from the deploy stage" 
 
cleanup: 
  stage: cleanup   script: 
-	echo "Cleaning up resources..." 
-	echo "Pipeline execution completed successfully!"


