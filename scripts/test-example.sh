example="$1";
success=0;

if [ -z $1 ]; then
  echo "Usage: Provide the name of the example project you want to test.";
  echo "\nAvailable examples:";
  echo $(ls examples);
  exit 1;
fi;

cd examples;

echo "Testing $example...";
cd $example;
ts-node ../../src/cli.ts generate && \
 ts-node ../../src/cli.ts install && \
 npx tsc server/.hathora/store.ts --esModuleInterop --target esnext --module esnext --moduleResolution node --noEmit
if [ $? -ne 0 ]; then
  echo "Failed to run example: $example";
  success=1;
fi;
cd ..;
exit $success;
