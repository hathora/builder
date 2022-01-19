pwd
echo "Running all examples."
cd examples;
success = 0;
for example in `ls`; do
  echo "Running $example";
  cd $example;
  ts-node ../../cli.ts;
  if [ $? -ne 0 ]; then
    echo "Failed to run example: $example";
    success = 1;
  fi;
  cd ..
done
exit $success;
