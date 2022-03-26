echo "Testing all examples..."
cd examples;
success=0;
for example in `ls`; do
  echo "Testing $example...";
  cd $example;
  ts-node ../../cli.ts generate && \
   ts-node ../../cli.ts install && \
   npx tsc server/.hathora/store.ts --esModuleInterop --target esnext --module esnext --moduleResolution node --noEmit
  if [ $? -ne 0 ]; then
    echo "Failed to run example: $example";
    success=1;
  fi;
  cd ..
done
exit $success;
