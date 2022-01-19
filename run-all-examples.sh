pwd
echo "Running all examples."
cd examples;
for example in `ls examples`; do
  echo "Running $example";
  cd $example;
  ts-node ../../cli.ts;
  if [ $? -ne 0 ]; then
    echo "Failed to run example: $example";
  fi;
done
