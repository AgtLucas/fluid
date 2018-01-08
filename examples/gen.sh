#! /bin/sh

# HelloWorld
fluid -l cpp -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/cpp-server -e server
fluid -l go -s HelloWorld/specs -m hello_world -n hello_world -d ./HelloWorld/go-server -e server
fluid -l haskell -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/haskell-server -e server -a scotty
fluid -l haskell -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/haskell-client -e client -a http-client
fluid -l java -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/java-server -e server
fluid -l javascript -s HelloWorld/specs -n helloWorld -m HelloWorld -d ./HelloWorld/javascript-client -e client
fluid -l purescript -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/purescript-server -e server
fluid -l purescript -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/purescript-client -e client
fluid -l rust -s HelloWorld/specs -m hello_world -n hello_world -d ./HelloWorld/rust-server -e server
fluid -l scala -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/scala-server -e server
fluid -l swift -s HelloWorld/specs -m HelloWorld -n HelloWorld -d ./HelloWorld/swift-server -e server

# HelloWorld with public specs
fluid -l haskell -s HelloWorldPublic/specs.json -m HelloWorld -n HelloWorld -d ./HelloWorldPublic/haskell-server -e server -a scotty
fluid -l haskell -s HelloWorldPublic/specs.json -m HelloWorld -n HelloWorld -d ./HelloWorldPublic/haskell-client -e client -a http-client

# Phonebook
fluid -l cpp -s Phonebook/specs -m Phonebook -n Phonebook -d ./Phonebook/cpp-server -e server
fluid -l go -s Phonebook/specs -m phonebook -n phonebook -d ./Phonebook/go-server -e server
fluid -l haskell -s Phonebook/specs -m Phonebook -n Phonebook -d ./Phonebook/haskell-server -e server -a scotty
fluid -l haskell -s Phonebook/specs -m Phonebook -n Phonebook -d ./Phonebook/haskell-client -e client -a http-client
fluid -l java -s Phonebook/specs -m Phonebook -n Phonebook -d ./Phonebook/java-server -e server
fluid -l javascript -s Phonebook/specs -m Phonebook -n phonebook -d ./Phonebook/javascript-client -e client
fluid -l purescript -s Phonebook/specs -m Phonebook -n Phonebook -d ./Phonebook/purescript-server -e server
fluid -l rust -s Phonebook/specs -m hello_world -n hello_world -d ./Phonebook/rust-server -e server
fluid -l scala -s Phonebook/specs -m HelloWorld -n HelloWorld -d ./Phonebook/scala-server -e server
fluid -l swift -s Phonebook/specs -m HelloWorld -n HelloWorld -d ./Phonebook/swift-server -e server
