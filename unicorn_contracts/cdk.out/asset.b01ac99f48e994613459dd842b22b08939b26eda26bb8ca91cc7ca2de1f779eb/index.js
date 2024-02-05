"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/LambdaInterface.js
var require_LambdaInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/LambdaInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/index.js
var require_lambda = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/utils/lambda/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_LambdaInterface(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/Utility.js
var require_Utility = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/Utility.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Utility = void 0;
    var Utility = class {
      constructor() {
        this.coldStart = true;
        this.defaultServiceName = "service_undefined";
      }
      getColdStart() {
        if (this.coldStart) {
          this.coldStart = false;
          return true;
        }
        return false;
      }
      isColdStart() {
        return this.getColdStart();
      }
      getDefaultServiceName() {
        return this.defaultServiceName;
      }
      /**
       * Validate that the service name provided is valid.
       * Used internally during initialization.
       *
       * @param serviceName - Service name to validate
       */
      isValidServiceName(serviceName) {
        return typeof serviceName === "string" && serviceName.trim().length > 0;
      }
    };
    exports.Utility = Utility;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/config/ConfigService.js
var require_ConfigService = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/config/ConfigService.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigService = void 0;
    var ConfigService = class {
    };
    exports.ConfigService = ConfigService;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/config/EnvironmentVariablesService.js
var require_EnvironmentVariablesService = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/config/EnvironmentVariablesService.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentVariablesService = void 0;
    var EnvironmentVariablesService = class {
      constructor() {
        this.devModeVariable = "POWERTOOLS_DEV";
        this.serviceNameVariable = "POWERTOOLS_SERVICE_NAME";
        this.xRayTraceIdVariable = "_X_AMZN_TRACE_ID";
      }
      /**
       * It returns the value of an environment variable that has given name.
       *
       * @param {string} name
       * @returns {string}
       */
      get(name) {
        return process.env[name]?.trim() || "";
      }
      /**
       * It returns the value of the POWERTOOLS_SERVICE_NAME environment variable.
       *
       * @returns {string}
       */
      getServiceName() {
        return this.get(this.serviceNameVariable);
      }
      /**
       * It returns the value of the _X_AMZN_TRACE_ID environment variable.
       *
       * The AWS X-Ray Trace data available in the environment variable has this format:
       * `Root=1-5759e988-bd862e3fe1be46a994272793;Parent=557abcec3ee5a047;Sampled=1`,
       *
       * The actual Trace ID is: `1-5759e988-bd862e3fe1be46a994272793`.
       *
       * @returns {string}
       */
      getXrayTraceId() {
        const xRayTraceData = this.getXrayTraceData();
        return xRayTraceData?.Root;
      }
      /**
       * It returns true if the Sampled flag is set in the _X_AMZN_TRACE_ID environment variable.
       *
       * The AWS X-Ray Trace data available in the environment variable has this format:
       * `Root=1-5759e988-bd862e3fe1be46a994272793;Parent=557abcec3ee5a047;Sampled=1`,
       *
       * @returns {boolean}
       */
      getXrayTraceSampled() {
        const xRayTraceData = this.getXrayTraceData();
        return xRayTraceData?.Sampled === "1";
      }
      /**
       * It returns true if the `POWERTOOLS_DEV` environment variable is set to truthy value.
       *
       * @returns {boolean}
       */
      isDevMode() {
        return this.isValueTrue(this.get(this.devModeVariable));
      }
      /**
       * It returns true if the string value represents a boolean true value.
       *
       * @param {string} value
       * @returns boolean
       */
      isValueTrue(value) {
        const truthyValues = ["1", "y", "yes", "t", "true", "on"];
        return truthyValues.includes(value.toLowerCase());
      }
      /**
       * It parses the key/value data present in the _X_AMZN_TRACE_ID environment variable
       * and returns it as an object when available.
       */
      getXrayTraceData() {
        const xRayTraceEnv = this.get(this.xRayTraceIdVariable);
        if (xRayTraceEnv === "")
          return void 0;
        if (!xRayTraceEnv.includes("="))
          return { Root: xRayTraceEnv };
        const xRayTraceData = {};
        xRayTraceEnv.split(";").forEach((field) => {
          const [key, value] = field.split("=");
          xRayTraceData[key] = value;
        });
        return xRayTraceData;
      }
    };
    exports.EnvironmentVariablesService = EnvironmentVariablesService;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/config/index.js
var require_config = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/config/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_ConfigService(), exports);
    __exportStar(require_EnvironmentVariablesService(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/hello-world.js
var require_hello_world = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/hello-world.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.helloworldContext = void 0;
    var helloworldContext = {
      callbackWaitsForEmptyEventLoop: true,
      functionVersion: "$LATEST",
      functionName: "foo-bar-function",
      memoryLimitInMB: "128",
      logGroupName: "/aws/lambda/foo-bar-function-123456abcdef",
      logStreamName: "2021/03/09/[$LATEST]abcdef123456abcdef123456abcdef123456",
      invokedFunctionArn: "arn:aws:lambda:eu-west-1:123456789012:function:foo-bar-function",
      awsRequestId: "c6af9ac6-7b61-11e6-9a41-93e812345678",
      getRemainingTimeInMillis: () => 1234,
      done: () => console.log("Done!"),
      fail: () => console.log("Failed!"),
      succeed: () => console.log("Succeeded!")
    };
    exports.helloworldContext = helloworldContext;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/index.js
var require_contexts = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/contexts/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_hello_world(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/custom/index.js
var require_custom = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/custom/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CustomEvent = void 0;
    exports.CustomEvent = {
      key1: "value1",
      key2: "value2",
      key3: "value3"
    };
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/index.js
var require_events = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/samples/resources/events/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Custom = void 0;
    exports.Custom = __importStar(require_custom());
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/types/middy.js
var require_middy = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/types/middy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/types/utils.js
var require_utils = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/types/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isNullOrUndefined = exports.isTruthy = exports.isString = exports.isRecord = void 0;
    var isRecord = (value) => {
      return Object.prototype.toString.call(value) === "[object Object]" && !Object.is(value, null);
    };
    exports.isRecord = isRecord;
    var isTruthy = (value) => {
      if (typeof value === "string") {
        return value !== "";
      } else if (typeof value === "number") {
        return value !== 0;
      } else if (typeof value === "boolean") {
        return value;
      } else if (Array.isArray(value)) {
        return value.length > 0;
      } else if (isRecord(value)) {
        return Object.keys(value).length > 0;
      } else {
        return false;
      }
    };
    exports.isTruthy = isTruthy;
    var isNullOrUndefined = (value) => {
      return Object.is(value, null) || Object.is(value, void 0);
    };
    exports.isNullOrUndefined = isNullOrUndefined;
    var isString = (value) => {
      return typeof value === "string";
    };
    exports.isString = isString;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/version.js
var require_version = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PT_VERSION = void 0;
    exports.PT_VERSION = "1.17.0";
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/awsSdk/utils.js
var require_utils2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/awsSdk/utils.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSdkClient = void 0;
    var isSdkClient = (client) => typeof client === "object" && client !== null && "send" in client && typeof client.send === "function" && "config" in client && client.config !== void 0 && typeof client.config === "object" && client.config !== null && "middlewareStack" in client && client.middlewareStack !== void 0 && typeof client.middlewareStack === "object" && client.middlewareStack !== null && "identify" in client.middlewareStack && typeof client.middlewareStack.identify === "function" && "addRelativeTo" in client.middlewareStack && typeof client.middlewareStack.addRelativeTo === "function";
    exports.isSdkClient = isSdkClient;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/awsSdk/userAgentMiddleware.js
var require_userAgentMiddleware = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/awsSdk/userAgentMiddleware.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addUserAgentMiddleware = exports.customUserAgentMiddleware = void 0;
    var version_1 = require_version();
    var utils_1 = require_utils2();
    var EXEC_ENV = process.env.AWS_EXECUTION_ENV || "NA";
    var middlewareOptions = {
      relation: "after",
      toMiddleware: "getUserAgentMiddleware",
      name: "addPowertoolsToUserAgent",
      tags: ["POWERTOOLS", "USER_AGENT"]
    };
    var customUserAgentMiddleware = (feature) => {
      return (next) => async (args) => {
        const powertoolsUserAgent = `PT/${feature}/${version_1.PT_VERSION} PTEnv/${EXEC_ENV}`;
        args.request.headers["user-agent"] = `${args.request.headers["user-agent"]} ${powertoolsUserAgent}`;
        return await next(args);
      };
    };
    exports.customUserAgentMiddleware = customUserAgentMiddleware;
    var hasPowertools = (middlewareStack) => {
      let found = false;
      for (const middleware of middlewareStack) {
        if (middleware.includes("addPowertoolsToUserAgent")) {
          found = true;
        }
      }
      return found;
    };
    var addUserAgentMiddleware = (client, feature) => {
      try {
        if ((0, utils_1.isSdkClient)(client)) {
          if (hasPowertools(client.middlewareStack.identify())) {
            return;
          }
          client.middlewareStack.addRelativeTo(customUserAgentMiddleware(feature), middlewareOptions);
        } else {
          throw new Error(`The client provided does not match the expected interface`);
        }
      } catch (error) {
        console.warn("Failed to add user agent middleware", error);
      }
    };
    exports.addUserAgentMiddleware = addUserAgentMiddleware;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/awsSdk/index.js
var require_awsSdk = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/awsSdk/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isSdkClient = exports.addUserAgentMiddleware = void 0;
    var userAgentMiddleware_1 = require_userAgentMiddleware();
    Object.defineProperty(exports, "addUserAgentMiddleware", { enumerable: true, get: function() {
      return userAgentMiddleware_1.addUserAgentMiddleware;
    } });
    var utils_1 = require_utils2();
    Object.defineProperty(exports, "isSdkClient", { enumerable: true, get: function() {
      return utils_1.isSdkClient;
    } });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/index.js
var require_lib = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    var __importStar = exports && exports.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Events = exports.ContextExamples = void 0;
    __exportStar(require_lambda(), exports);
    __exportStar(require_Utility(), exports);
    __exportStar(require_config(), exports);
    exports.ContextExamples = __importStar(require_contexts());
    exports.Events = __importStar(require_events());
    __exportStar(require_middy(), exports);
    __exportStar(require_utils(), exports);
    __exportStar(require_awsSdk(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/config/ConfigServiceInterface.js
var require_ConfigServiceInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/config/ConfigServiceInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/config/EnvironmentVariablesService.js
var require_EnvironmentVariablesService2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/config/EnvironmentVariablesService.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentVariablesService = void 0;
    var commons_1 = require_lib();
    var EnvironmentVariablesService = class extends commons_1.EnvironmentVariablesService {
      constructor() {
        super(...arguments);
        this.namespaceVariable = "POWERTOOLS_METRICS_NAMESPACE";
      }
      getNamespace() {
        return this.get(this.namespaceVariable);
      }
    };
    exports.EnvironmentVariablesService = EnvironmentVariablesService;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/config/index.js
var require_config2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/config/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_ConfigServiceInterface(), exports);
    __exportStar(require_EnvironmentVariablesService2(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/constants.js
var require_constants = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MAX_DIMENSION_COUNT = exports.MAX_METRIC_VALUES_SIZE = exports.MAX_METRICS_SIZE = exports.DEFAULT_NAMESPACE = exports.COLD_START_METRIC = void 0;
    var COLD_START_METRIC = "ColdStart";
    exports.COLD_START_METRIC = COLD_START_METRIC;
    var DEFAULT_NAMESPACE = "default_namespace";
    exports.DEFAULT_NAMESPACE = DEFAULT_NAMESPACE;
    var MAX_METRICS_SIZE = 100;
    exports.MAX_METRICS_SIZE = MAX_METRICS_SIZE;
    var MAX_METRIC_VALUES_SIZE = 100;
    exports.MAX_METRIC_VALUES_SIZE = MAX_METRIC_VALUES_SIZE;
    var MAX_DIMENSION_COUNT = 29;
    exports.MAX_DIMENSION_COUNT = MAX_DIMENSION_COUNT;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/Metrics.js
var require_Metrics = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/Metrics.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/MetricUnit.js
var require_MetricUnit = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/MetricUnit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetricUnits = void 0;
    var MetricUnits2;
    (function(MetricUnits3) {
      MetricUnits3["Seconds"] = "Seconds";
      MetricUnits3["Microseconds"] = "Microseconds";
      MetricUnits3["Milliseconds"] = "Milliseconds";
      MetricUnits3["Bytes"] = "Bytes";
      MetricUnits3["Kilobytes"] = "Kilobytes";
      MetricUnits3["Megabytes"] = "Megabytes";
      MetricUnits3["Gigabytes"] = "Gigabytes";
      MetricUnits3["Terabytes"] = "Terabytes";
      MetricUnits3["Bits"] = "Bits";
      MetricUnits3["Kilobits"] = "Kilobits";
      MetricUnits3["Megabits"] = "Megabits";
      MetricUnits3["Gigabits"] = "Gigabits";
      MetricUnits3["Terabits"] = "Terabits";
      MetricUnits3["Percent"] = "Percent";
      MetricUnits3["Count"] = "Count";
      MetricUnits3["BytesPerSecond"] = "Bytes/Second";
      MetricUnits3["KilobytesPerSecond"] = "Kilobytes/Second";
      MetricUnits3["MegabytesPerSecond"] = "Megabytes/Second";
      MetricUnits3["GigabytesPerSecond"] = "Gigabytes/Second";
      MetricUnits3["TerabytesPerSecond"] = "Terabytes/Second";
      MetricUnits3["BitsPerSecond"] = "Bits/Second";
      MetricUnits3["KilobitsPerSecond"] = "Kilobits/Second";
      MetricUnits3["MegabitsPerSecond"] = "Megabits/Second";
      MetricUnits3["GigabitsPerSecond"] = "Gigabits/Second";
      MetricUnits3["TerabitsPerSecond"] = "Terabits/Second";
      MetricUnits3["CountPerSecond"] = "Count/Second";
    })(MetricUnits2 || (exports.MetricUnits = MetricUnits2 = {}));
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/MetricResolution.js
var require_MetricResolution = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/MetricResolution.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetricResolution = void 0;
    var MetricResolution = {
      Standard: 60,
      High: 1
    };
    exports.MetricResolution = MetricResolution;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/index.js
var require_types = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/types/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_Metrics(), exports);
    __exportStar(require_MetricUnit(), exports);
    __exportStar(require_MetricResolution(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/Metrics.js
var require_Metrics2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/Metrics.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MetricResolution = exports.MetricUnits = exports.Metrics = void 0;
    var node_console_1 = require("node:console");
    var commons_1 = require_lib();
    var config_1 = require_config2();
    var constants_1 = require_constants();
    var types_1 = require_types();
    Object.defineProperty(exports, "MetricUnits", { enumerable: true, get: function() {
      return types_1.MetricUnits;
    } });
    Object.defineProperty(exports, "MetricResolution", { enumerable: true, get: function() {
      return types_1.MetricResolution;
    } });
    var Metrics2 = class extends commons_1.Utility {
      constructor(options = {}) {
        super();
        this.defaultDimensions = {};
        this.dimensions = {};
        this.isSingleMetric = false;
        this.metadata = {};
        this.shouldThrowOnEmptyMetrics = false;
        this.storedMetrics = {};
        this.dimensions = {};
        this.setOptions(options);
      }
      /**
       * Add a dimension to the metrics.
       *
       * A dimension is a key-value pair that is used to group metrics.
       *
       * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Dimension for more details.
       * @param name
       * @param value
       */
      addDimension(name, value) {
        if (constants_1.MAX_DIMENSION_COUNT <= this.getCurrentDimensionsCount()) {
          throw new RangeError(`The number of metric dimensions must be lower than ${constants_1.MAX_DIMENSION_COUNT}`);
        }
        this.dimensions[name] = value;
      }
      /**
       * Add multiple dimensions to the metrics.
       *
       * A dimension is a key-value pair that is used to group metrics.
       *
       * @param dimensions A key-value pair of dimensions
       */
      addDimensions(dimensions) {
        const newDimensions = { ...this.dimensions };
        Object.keys(dimensions).forEach((dimensionName) => {
          newDimensions[dimensionName] = dimensions[dimensionName];
        });
        if (Object.keys(newDimensions).length > constants_1.MAX_DIMENSION_COUNT) {
          throw new RangeError(`Unable to add ${Object.keys(dimensions).length} dimensions: the number of metric dimensions must be lower than ${constants_1.MAX_DIMENSION_COUNT}`);
        }
        this.dimensions = newDimensions;
      }
      /**
       * A high-cardinality data part of your Metrics log.
       *
       * This is useful when you want to search highly contextual information along with your metrics in your logs.
       *
       * @param key The key of the metadata
       * @param value The value of the metadata
       */
      addMetadata(key, value) {
        this.metadata[key] = value;
      }
      /**
       * Add a metric to the metrics buffer.
       *
       * By default, metrics are buffered and flushed at the end of the Lambda invocation
       * or when calling {@link Metrics.publishStoredMetrics}.
       *
       * You can add a metric by specifying the metric name, unit, and value. For convenience,
       * we provide a set of constants for the most common units in {@link MetricUnits}.
       *
       * @example
       * ```typescript
       * import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
       *
       * const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });
       *
       * metrics.addMetric('successfulBooking', MetricUnits.Count, 1);
       * ```
       *
       * Optionally, you can specify the metric resolution, which can be either `High` or `Standard`.
       * By default, metrics are published with a resolution of `Standard`, click [here](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Resolution_definition)
       * to learn more about metric resolutions.
       *
       * @example
       * ```typescript
       * import { Metrics, MetricUnits, MetricResolution } from '@aws-lambda-powertools/metrics';
       *
       * const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });
       *
       * metrics.addMetric('successfulBooking', MetricUnits.Count, 1, MetricResolution.High);
       * ```
       *
       * @param name - The metric name
       * @param unit - The metric unit
       * @param value - The metric value
       * @param resolution - The metric resolution
       */
      addMetric(name, unit, value, resolution = types_1.MetricResolution.Standard) {
        this.storeMetric(name, unit, value, resolution);
        if (this.isSingleMetric)
          this.publishStoredMetrics();
      }
      /**
       * Create a singleMetric to capture cold start.
       *
       * If it's a cold start invocation, this feature will:
       *   * Create a separate EMF blob that contains a single metric named ColdStart
       *   * Add function_name and service dimensions
       *
       * This has the advantage of keeping cold start metric separate from your application metrics, where you might have unrelated dimensions,
       * as well as avoiding potential data loss from metrics not being published for other reasons.
       *
       * @example
       * ```typescript
       * import { Metrics } from '@aws-lambda-powertools/metrics';
       *
       * const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });
       *
       * export const handler = async (_event: unknown, __context: unknown): Promise<void> => {
       *     metrics.captureColdStartMetric();
       * };
       * ```
       */
      captureColdStartMetric() {
        if (!this.isColdStart())
          return;
        const singleMetric = this.singleMetric();
        if (this.defaultDimensions.service) {
          singleMetric.setDefaultDimensions({
            service: this.defaultDimensions.service
          });
        }
        if (this.functionName != null) {
          singleMetric.addDimension("function_name", this.functionName);
        }
        singleMetric.addMetric(constants_1.COLD_START_METRIC, types_1.MetricUnits.Count, 1);
      }
      /**
       * Clear all default dimensions.
       */
      clearDefaultDimensions() {
        this.defaultDimensions = {};
      }
      /**
       * Clear all dimensions.
       */
      clearDimensions() {
        this.dimensions = {};
      }
      /**
       * Clear all metadata.
       */
      clearMetadata() {
        this.metadata = {};
      }
      /**
       * Clear all the metrics stored in the buffer.
       */
      clearMetrics() {
        this.storedMetrics = {};
      }
      /**
       * A decorator automating coldstart capture, throw on empty metrics and publishing metrics on handler exit.
       *
       * @example
       *
       * ```typescript
       * import { Metrics } from '@aws-lambda-powertools/metrics';
       * import { LambdaInterface } from '@aws-lambda-powertools/commons';
       *
       * const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' });
       *
       * class Lambda implements LambdaInterface {
       *
       *   @metrics.logMetrics({ captureColdStartMetric: true })
       *   public handler(_event: unknown, __context: unknown): Promise<void> {
       *    // ...
       *   }
       * }
       *
       * const handlerClass = new Lambda();
       * export const handler = handlerClass.handler.bind(handlerClass);
       * ```
       *
       * @decorator Class
       */
      logMetrics(options = {}) {
        const { throwOnEmptyMetrics, defaultDimensions, captureColdStartMetric } = options;
        if (throwOnEmptyMetrics) {
          this.throwOnEmptyMetrics();
        }
        if (defaultDimensions !== void 0) {
          this.setDefaultDimensions(defaultDimensions);
        }
        return (_target, _propertyKey, descriptor) => {
          const originalMethod = descriptor.value;
          const metricsRef = this;
          descriptor.value = async function(event, context, callback) {
            metricsRef.functionName = context.functionName;
            if (captureColdStartMetric)
              metricsRef.captureColdStartMetric();
            let result;
            try {
              result = await originalMethod.apply(this, [event, context, callback]);
            } catch (error) {
              throw error;
            } finally {
              metricsRef.publishStoredMetrics();
            }
            return result;
          };
          return descriptor;
        };
      }
      /**
       * Synchronous function to actually publish your metrics. (Not needed if using logMetrics decorator).
       * It will create a new EMF blob and log it to standard output to be then ingested by Cloudwatch logs and processed automatically for metrics creation.
       *
       * @example
       *
       * ```typescript
       * import { Metrics, MetricUnits } from '@aws-lambda-powertools/metrics';
       *
       * const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName: 'orders' }); // Sets metric namespace, and service as a metric dimension
       *
       * export const handler = async (_event: unknown, __context: unknown): Promise<void> => {
       *   metrics.addMetric('test-metric', MetricUnits.Count, 10);
       *   metrics.publishStoredMetrics();
       * };
       * ```
       */
      publishStoredMetrics() {
        if (!this.shouldThrowOnEmptyMetrics && Object.keys(this.storedMetrics).length === 0) {
          console.warn("No application metrics to publish. The cold-start metric may be published if enabled. If application metrics should never be empty, consider using `throwOnEmptyMetrics`");
        }
        const target = this.serializeMetrics();
        this.console.log(JSON.stringify(target));
        this.clearMetrics();
        this.clearDimensions();
        this.clearMetadata();
      }
      /**
       * Function to create a new metric object compliant with the EMF (Embedded Metric Format) schema which
       * includes the metric name, unit, and optionally storage resolution.
       *
       * The function will create a new EMF blob and log it to standard output to be then ingested by Cloudwatch
       * logs and processed automatically for metrics creation.
       *
       * @returns metrics as JSON object compliant EMF Schema Specification
       * @see https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Embedded_Metric_Format_Specification.html for more details
       */
      serializeMetrics() {
        const metricDefinitions = Object.values(this.storedMetrics).map((metricDefinition) => ({
          Name: metricDefinition.name,
          Unit: metricDefinition.unit,
          ...metricDefinition.resolution === types_1.MetricResolution.High ? { StorageResolution: metricDefinition.resolution } : {}
        }));
        if (metricDefinitions.length === 0 && this.shouldThrowOnEmptyMetrics) {
          throw new RangeError("The number of metrics recorded must be higher than zero");
        }
        if (!this.namespace)
          console.warn("Namespace should be defined, default used");
        const metricValues = Object.values(this.storedMetrics).reduce((result, { name, value }) => {
          result[name] = value;
          return result;
        }, {});
        const dimensionNames = [
          .../* @__PURE__ */ new Set([
            ...Object.keys(this.defaultDimensions),
            ...Object.keys(this.dimensions)
          ])
        ];
        return {
          _aws: {
            Timestamp: (/* @__PURE__ */ new Date()).getTime(),
            CloudWatchMetrics: [
              {
                Namespace: this.namespace || constants_1.DEFAULT_NAMESPACE,
                Dimensions: [dimensionNames],
                Metrics: metricDefinitions
              }
            ]
          },
          ...this.defaultDimensions,
          ...this.dimensions,
          ...metricValues,
          ...this.metadata
        };
      }
      /**
       * Sets default dimensions that will be added to all metrics.
       *
       * @param dimensions The default dimensions to be added to all metrics.
       */
      setDefaultDimensions(dimensions) {
        const targetDimensions = {
          ...this.defaultDimensions,
          ...dimensions
        };
        if (constants_1.MAX_DIMENSION_COUNT <= Object.keys(targetDimensions).length) {
          throw new Error("Max dimension count hit");
        }
        this.defaultDimensions = targetDimensions;
      }
      /**
       * Sets the function name to be added to the metric.
       *
       * @param value The function name to be added to the metric.
       */
      setFunctionName(value) {
        this.functionName = value;
      }
      /**
       * CloudWatch EMF uses the same dimensions across all your metrics. Use singleMetric if you have a metric that should have different dimensions.
       *
       * You don't need to call publishStoredMetrics() after calling addMetric for a singleMetrics, they will be flushed directly.
       *
       * @example
       *
       * ```typescript
       * const singleMetric = metrics.singleMetric();
       * singleMetric.addDimension('InnerDimension', 'true');
       * singleMetric.addMetric('single-metric', MetricUnits.Percent, 50);
       * ```
       *
       * @returns the Metrics
       */
      singleMetric() {
        return new Metrics2({
          namespace: this.namespace,
          serviceName: this.dimensions.service,
          defaultDimensions: this.defaultDimensions,
          singleMetric: true
        });
      }
      /**
       * Throw an Error if the metrics buffer is empty.
       *
       * @example
       *
       * ```typescript
       * import { Metrics } from '@aws-lambda-powertools/metrics';
       *
       * const metrics = new Metrics({ namespace: 'serverlessAirline', serviceName:'orders' });
       *
       * export const handler = async (_event: unknown, __context: unknown): Promise<void> => {
       *     metrics.throwOnEmptyMetrics();
       *     metrics.publishStoredMetrics(); // will throw since no metrics added.
       * };
       * ```
       */
      throwOnEmptyMetrics() {
        this.shouldThrowOnEmptyMetrics = true;
      }
      /**
       * Gets the current number of dimensions stored.
       *
       * @returns the number of dimensions currently stored
       */
      getCurrentDimensionsCount() {
        return Object.keys(this.dimensions).length + Object.keys(this.defaultDimensions).length;
      }
      /**
       * Gets the custom config service if it exists.
       *
       * @returns the custom config service if it exists, undefined otherwise
       */
      getCustomConfigService() {
        return this.customConfigService;
      }
      /**
       * Gets the environment variables service.
       *
       * @returns the environment variables service
       */
      getEnvVarsService() {
        return this.envVarsService;
      }
      /**
       * Checks if a metric is new or not.
       *
       * A metric is considered new if there is no metric with the same name already stored.
       *
       * When a metric is not new, we also check if the unit is consistent with the stored metric with
       * the same name. If the units are inconsistent, we throw an error as this is likely a bug or typo.
       * This can happen if a metric is added without using the `MetricUnit` helper in JavaScript codebases.
       *
       * @param name The name of the metric
       * @param unit The unit of the metric
       * @returns true if the metric is new, false if another metric with the same name already exists
       */
      isNewMetric(name, unit) {
        if (this.storedMetrics[name]) {
          if (this.storedMetrics[name].unit !== unit) {
            const currentUnit = this.storedMetrics[name].unit;
            throw new Error(`Metric "${name}" has already been added with unit "${currentUnit}", but we received unit "${unit}". Did you mean to use metric unit "${currentUnit}"?`);
          }
          return false;
        } else {
          return true;
        }
      }
      /**
       * It initializes console property as an instance of the internal version of Console() class (PR #748)
       * or as the global node console if the `POWERTOOLS_DEV' env variable is set and has truthy value.
       *
       * @private
       * @returns {void}
       */
      setConsole() {
        if (!this.getEnvVarsService().isDevMode()) {
          this.console = new node_console_1.Console({
            stdout: process.stdout,
            stderr: process.stderr
          });
        } else {
          this.console = console;
        }
      }
      /**
       * Sets the custom config service to be used.
       *
       * @param customConfigService The custom config service to be used
       */
      setCustomConfigService(customConfigService) {
        this.customConfigService = customConfigService ? customConfigService : void 0;
      }
      /**
       * Sets the environment variables service to be used.
       */
      setEnvVarsService() {
        this.envVarsService = new config_1.EnvironmentVariablesService();
      }
      /**
       * Sets the namespace to be used.
       *
       * @param namespace The namespace to be used
       */
      setNamespace(namespace) {
        this.namespace = namespace || this.getCustomConfigService()?.getNamespace() || this.getEnvVarsService().getNamespace();
      }
      /**
       * Sets the options to be used by the Metrics instance.
       *
       * This method is used during the initialization of the Metrics instance.
       *
       * @param options The options to be used
       * @returns the Metrics instance
       */
      setOptions(options) {
        const { customConfigService, namespace, serviceName, singleMetric, defaultDimensions } = options;
        this.setEnvVarsService();
        this.setConsole();
        this.setCustomConfigService(customConfigService);
        this.setNamespace(namespace);
        this.setService(serviceName);
        this.setDefaultDimensions(defaultDimensions);
        this.isSingleMetric = singleMetric || false;
        return this;
      }
      /**
       * Sets the service to be used.
       *
       * @param service The service to be used
       */
      setService(service) {
        const targetService = service || this.getCustomConfigService()?.getServiceName() || this.getEnvVarsService().getServiceName() || this.getDefaultServiceName();
        if (targetService.length > 0) {
          this.setDefaultDimensions({ service: targetService });
        }
      }
      /**
       * Stores a metric in the buffer.
       *
       * If the buffer is full, or the metric reaches the maximum number of values,
       * the buffer is published to stdout.
       *
       * @param name The name of the metric to store
       * @param unit The unit of the metric to store
       * @param value The value of the metric to store
       * @param resolution The resolution of the metric to store
       */
      storeMetric(name, unit, value, resolution) {
        if (Object.keys(this.storedMetrics).length >= constants_1.MAX_METRICS_SIZE) {
          this.publishStoredMetrics();
        }
        if (this.isNewMetric(name, unit)) {
          this.storedMetrics[name] = {
            unit,
            value,
            name,
            resolution
          };
        } else {
          const storedMetric = this.storedMetrics[name];
          if (!Array.isArray(storedMetric.value)) {
            storedMetric.value = [storedMetric.value];
          }
          storedMetric.value.push(value);
          if (storedMetric.value.length === constants_1.MAX_METRIC_VALUES_SIZE) {
            this.publishStoredMetrics();
          }
        }
      }
    };
    exports.Metrics = Metrics2;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/MetricsInterface.js
var require_MetricsInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/MetricsInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/middleware/constants.js
var require_constants2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/middleware/constants.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IDEMPOTENCY_KEY = exports.LOGGER_KEY = exports.METRICS_KEY = exports.TRACER_KEY = exports.PREFIX = void 0;
    var PREFIX = "powertools-for-aws";
    exports.PREFIX = PREFIX;
    var TRACER_KEY = `${PREFIX}.tracer`;
    exports.TRACER_KEY = TRACER_KEY;
    var METRICS_KEY = `${PREFIX}.metrics`;
    exports.METRICS_KEY = METRICS_KEY;
    var LOGGER_KEY = `${PREFIX}.logger`;
    exports.LOGGER_KEY = LOGGER_KEY;
    var IDEMPOTENCY_KEY = `${PREFIX}.idempotency`;
    exports.IDEMPOTENCY_KEY = IDEMPOTENCY_KEY;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/middleware/cleanupMiddlewares.js
var require_cleanupMiddlewares = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/middleware/cleanupMiddlewares.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanupMiddlewares = void 0;
    var constants_1 = require_constants2();
    var isFunction = (obj) => {
      return typeof obj === "function";
    };
    var cleanupMiddlewares = async (request) => {
      const cleanupFunctionNames = [
        constants_1.TRACER_KEY,
        constants_1.METRICS_KEY,
        constants_1.LOGGER_KEY,
        constants_1.IDEMPOTENCY_KEY
      ];
      for (const functionName of cleanupFunctionNames) {
        if (Object(request.internal).hasOwnProperty(functionName)) {
          const functionReference = request.internal[functionName];
          if (isFunction(functionReference)) {
            await functionReference(request);
          }
        }
      }
    };
    exports.cleanupMiddlewares = cleanupMiddlewares;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/middleware/index.js
var require_middleware = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+commons@1.17.0/node_modules/@aws-lambda-powertools/commons/lib/middleware/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_cleanupMiddlewares(), exports);
    __exportStar(require_constants2(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/middleware/middy.js
var require_middy2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/middleware/middy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logMetrics = void 0;
    var middleware_1 = require_middleware();
    var logMetrics = (target, options = {}) => {
      const metricsInstances = target instanceof Array ? target : [target];
      const setCleanupFunction = (request) => {
        request.internal = {
          ...request.internal,
          [middleware_1.METRICS_KEY]: logMetricsAfterOrError
        };
      };
      const logMetricsBefore = async (request) => {
        metricsInstances.forEach((metrics2) => {
          metrics2.setFunctionName(request.context.functionName);
          const { throwOnEmptyMetrics, defaultDimensions, captureColdStartMetric } = options;
          if (throwOnEmptyMetrics) {
            metrics2.throwOnEmptyMetrics();
          }
          if (defaultDimensions !== void 0) {
            metrics2.setDefaultDimensions(defaultDimensions);
          }
          if (captureColdStartMetric) {
            metrics2.captureColdStartMetric();
          }
        });
        setCleanupFunction(request);
      };
      const logMetricsAfterOrError = async () => {
        metricsInstances.forEach((metrics2) => {
          metrics2.publishStoredMetrics();
        });
      };
      return {
        before: logMetricsBefore,
        after: logMetricsAfterOrError,
        onError: logMetricsAfterOrError
      };
    };
    exports.logMetrics = logMetrics;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/middleware/index.js
var require_middleware2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/middleware/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_middy2(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/index.js
var require_lib2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+metrics@1.17.0/node_modules/@aws-lambda-powertools/metrics/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_Metrics2(), exports);
    __exportStar(require_MetricsInterface(), exports);
    __exportStar(require_middleware2(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/helpers.js
var require_helpers = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/helpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLogger = void 0;
    var _1 = require_lib3();
    var createLogger = (options = {}) => new _1.Logger(options);
    exports.createLogger = createLogger;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatter.js
var require_LogFormatter = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogFormatter = void 0;
    var isErrorWithCause = (error) => {
      return "cause" in error;
    };
    var LogFormatter = class {
      /**
       * It formats a given Error parameter.
       *
       * @param {Error} error
       * @returns {LogAttributes}
       */
      formatError(error) {
        return {
          name: error.name,
          location: this.getCodeLocation(error.stack),
          message: error.message,
          stack: error.stack,
          cause: isErrorWithCause(error) ? error.cause instanceof Error ? this.formatError(error.cause) : error.cause : void 0
        };
      }
      /**
       * It formats a date into a string in simplified extended ISO format (ISO 8601).
       *
       * @param {Date} now
       * @returns {string}
       */
      formatTimestamp(now) {
        return now.toISOString();
      }
      /**
       * It returns a string containing the location of an error, given a particular stack trace.
       *
       * @param stack
       * @returns {string}
       */
      getCodeLocation(stack) {
        if (!stack) {
          return "";
        }
        const stackLines = stack.split("\n");
        const regex = /\((.*):(\d+):(\d+)\)\\?$/;
        let i;
        for (i = 0; i < stackLines.length; i++) {
          const match = regex.exec(stackLines[i]);
          if (Array.isArray(match)) {
            return `${match[1]}:${Number(match[2])}`;
          }
        }
        return "";
      }
    };
    exports.LogFormatter = LogFormatter;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatterInterface.js
var require_LogFormatterInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/LogFormatterInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/PowertoolLogFormatter.js
var require_PowertoolLogFormatter = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/PowertoolLogFormatter.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PowertoolLogFormatter = void 0;
    var _1 = require_formatter();
    var PowertoolLogFormatter = class extends _1.LogFormatter {
      /**
       * It formats key-value pairs of log attributes.
       *
       * @param {UnformattedAttributes} attributes
       * @returns {PowertoolLog}
       */
      formatAttributes(attributes) {
        return {
          cold_start: attributes.lambdaContext?.coldStart,
          function_arn: attributes.lambdaContext?.invokedFunctionArn,
          function_memory_size: attributes.lambdaContext?.memoryLimitInMB,
          function_name: attributes.lambdaContext?.functionName,
          function_request_id: attributes.lambdaContext?.awsRequestId,
          level: attributes.logLevel,
          message: attributes.message,
          sampling_rate: attributes.sampleRateValue,
          service: attributes.serviceName,
          timestamp: this.formatTimestamp(attributes.timestamp),
          xray_trace_id: attributes.xRayTraceId
        };
      }
    };
    exports.PowertoolLogFormatter = PowertoolLogFormatter;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/index.js
var require_formatter = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/formatter/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_LogFormatter(), exports);
    __exportStar(require_LogFormatterInterface(), exports);
    __exportStar(require_PowertoolLogFormatter(), exports);
  }
});

// ../node_modules/.pnpm/lodash.merge@4.6.2/node_modules/lodash.merge/index.js
var require_lodash = __commonJS({
  "../node_modules/.pnpm/lodash.merge@4.6.2/node_modules/lodash.merge/index.js"(exports, module2) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var asyncTag = "[object AsyncFunction]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var nullTag = "[object Null]";
    var objectTag = "[object Object]";
    var proxyTag = "[object Proxy]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var undefinedTag = "[object Undefined]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var nativeObjectToString = objectProto.toString;
    var objectCtorString = funcToString.call(Object);
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var allocUnsafe = Buffer2 ? Buffer2.allocUnsafe : void 0;
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    var objectCreate = Object.create;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var defineProperty = function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    }();
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeMax = Math.max;
    var nativeNow = Date.now;
    var Map2 = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var baseCreate = function() {
      function object() {
      }
      return function(proto) {
        if (!isObject(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    }();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    var baseFor = createBaseFor();
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseKeysIn(object) {
      if (!isObject(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isIterateeCall(value, index, object) {
      if (!isObject(object)) {
        return false;
      }
      var type = typeof index;
      if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
        return eq(object[index], value);
      }
      return false;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    var setToString = shortOut(baseSetToString);
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArguments = baseIsArguments(function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    function constant(value) {
      return function() {
        return value;
      };
    }
    function identity(value) {
      return value;
    }
    function stubFalse() {
      return false;
    }
    module2.exports = merge;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/log/LogItem.js
var require_LogItem = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/log/LogItem.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LogItem = void 0;
    var lodash_merge_1 = __importDefault(require_lodash());
    var LogItem = class {
      constructor(params) {
        this.attributes = {};
        this.addAttributes(params.baseAttributes);
        this.addAttributes(params.persistentAttributes);
      }
      addAttributes(attributes) {
        this.attributes = (0, lodash_merge_1.default)(this.attributes, attributes);
        return this;
      }
      getAttributes() {
        return this.attributes;
      }
      prepareForPrint() {
        this.setAttributes(this.removeEmptyKeys(this.getAttributes()));
      }
      removeEmptyKeys(attributes) {
        const newAttributes = {};
        for (const key in attributes) {
          if (attributes[key] !== void 0 && attributes[key] !== "" && attributes[key] !== null) {
            newAttributes[key] = attributes[key];
          }
        }
        return newAttributes;
      }
      setAttributes(attributes) {
        this.attributes = attributes;
      }
    };
    exports.LogItem = LogItem;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/log/LogItemInterface.js
var require_LogItemInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/log/LogItemInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/log/index.js
var require_log = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/log/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_LogItem(), exports);
    __exportStar(require_LogItemInterface(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/config/ConfigServiceInterface.js
var require_ConfigServiceInterface2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/config/ConfigServiceInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/config/EnvironmentVariablesService.js
var require_EnvironmentVariablesService3 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/config/EnvironmentVariablesService.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentVariablesService = void 0;
    var commons_1 = require_lib();
    var EnvironmentVariablesService = class extends commons_1.EnvironmentVariablesService {
      constructor() {
        super(...arguments);
        this.awsLogLevelVariable = "AWS_LAMBDA_LOG_LEVEL";
        this.awsRegionVariable = "AWS_REGION";
        this.currentEnvironmentVariable = "ENVIRONMENT";
        this.functionNameVariable = "AWS_LAMBDA_FUNCTION_NAME";
        this.functionVersionVariable = "AWS_LAMBDA_FUNCTION_VERSION";
        this.logEventVariable = "POWERTOOLS_LOGGER_LOG_EVENT";
        this.logLevelVariable = "POWERTOOLS_LOG_LEVEL";
        this.logLevelVariableLegacy = "LOG_LEVEL";
        this.memoryLimitInMBVariable = "AWS_LAMBDA_FUNCTION_MEMORY_SIZE";
        this.sampleRateValueVariable = "POWERTOOLS_LOGGER_SAMPLE_RATE";
      }
      /**
       * It returns the value of the `AWS_LAMBDA_LOG_LEVEL` environment variable.
       *
       * The `AWS_LAMBDA_LOG_LEVEL` environment variable is set by AWS Lambda when configuring
       * the function's log level using the Advanced Logging Controls feature. This value always
       * takes precedence over other means of configuring the log level.
       *
       * @note we need to map the `FATAL` log level to `CRITICAL`, see {@link https://docs.aws.amazon.com/lambda/latest/dg/configuration-logging.html#configuration-logging-log-levels AWS Lambda Log Levels}.
       *
       * @returns {string}
       */
      getAwsLogLevel() {
        const awsLogLevelVariable = this.get(this.awsLogLevelVariable);
        return awsLogLevelVariable === "FATAL" ? "CRITICAL" : awsLogLevelVariable;
      }
      /**
       * It returns the value of the AWS_REGION environment variable.
       *
       * @returns {string}
       */
      getAwsRegion() {
        return this.get(this.awsRegionVariable);
      }
      /**
       * It returns the value of the ENVIRONMENT environment variable.
       *
       * @returns {string}
       */
      getCurrentEnvironment() {
        return this.get(this.currentEnvironmentVariable);
      }
      /**
       * It returns the value of the AWS_LAMBDA_FUNCTION_MEMORY_SIZE environment variable.
       *
       * @returns {string}
       */
      getFunctionMemory() {
        const value = this.get(this.memoryLimitInMBVariable);
        return Number(value);
      }
      /**
       * It returns the value of the AWS_LAMBDA_FUNCTION_NAME environment variable.
       *
       * @returns {string}
       */
      getFunctionName() {
        return this.get(this.functionNameVariable);
      }
      /**
       * It returns the value of the AWS_LAMBDA_FUNCTION_VERSION environment variable.
       *
       * @returns {string}
       */
      getFunctionVersion() {
        return this.get(this.functionVersionVariable);
      }
      /**
       * It returns the value of the POWERTOOLS_LOGGER_LOG_EVENT environment variable.
       *
       * @returns {boolean}
       */
      getLogEvent() {
        const value = this.get(this.logEventVariable);
        return this.isValueTrue(value);
      }
      /**
       * It returns the value of the `POWERTOOLS_LOG_LEVEL, or `LOG_LEVEL` (legacy) environment variables
       * when the first one is not set.
       *
       * @note The `LOG_LEVEL` environment variable is considered legacy and will be removed in a future release.
       * @note The `AWS_LAMBDA_LOG_LEVEL` environment variable always takes precedence over the ones above.
       *
       * @returns {string}
       */
      getLogLevel() {
        const logLevelVariable = this.get(this.logLevelVariable);
        const logLevelVariableAlias = this.get(this.logLevelVariableLegacy);
        return logLevelVariable !== "" ? logLevelVariable : logLevelVariableAlias;
      }
      /**
       * It returns the value of the POWERTOOLS_LOGGER_SAMPLE_RATE environment variable.
       *
       * @returns {string|undefined}
       */
      getSampleRateValue() {
        const value = this.get(this.sampleRateValueVariable);
        return value && value.length > 0 ? Number(value) : void 0;
      }
    };
    exports.EnvironmentVariablesService = EnvironmentVariablesService;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/config/index.js
var require_config3 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/config/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_ConfigServiceInterface2(), exports);
    __exportStar(require_EnvironmentVariablesService3(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/Logger.js
var require_Logger = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/Logger.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Logger = void 0;
    var node_crypto_1 = require("node:crypto");
    var node_console_1 = require("node:console");
    var node_util_1 = require("node:util");
    var commons_1 = require_lib();
    var formatter_1 = require_formatter();
    var log_1 = require_log();
    var lodash_merge_1 = __importDefault(require_lodash());
    var config_1 = require_config3();
    var Logger2 = class extends commons_1.Utility {
      /**
       * Log level used by the current instance of Logger.
       *
       * Returns the log level as a number. The higher the number, the less verbose the logs.
       * To get the log level name, use the {@link getLevelName()} method.
       */
      get level() {
        return this.logLevel;
      }
      /**
       * It initializes the Logger class with an optional set of options (settings).
       * *
       * @param {ConstructorOptions} options
       */
      constructor(options = {}) {
        super();
        this.logEvent = false;
        this.logIndentation = 0;
        this.logLevel = 12;
        this.logLevelThresholds = {
          DEBUG: 8,
          INFO: 12,
          WARN: 16,
          ERROR: 20,
          CRITICAL: 24,
          SILENT: 28
        };
        this.logsSampled = false;
        this.persistentLogAttributes = {};
        this.powertoolLogData = {};
        this.setOptions(options);
      }
      /**
       * It adds the current Lambda function's invocation context data to the powertoolLogData property of the instance.
       * This context data will be part of all printed log items.
       *
       * @param {Context} context
       * @returns {void}
       */
      addContext(context) {
        const lambdaContext = {
          invokedFunctionArn: context.invokedFunctionArn,
          coldStart: this.getColdStart(),
          awsRequestId: context.awsRequestId,
          memoryLimitInMB: Number(context.memoryLimitInMB),
          functionName: context.functionName,
          functionVersion: context.functionVersion
        };
        this.addToPowertoolLogData({
          lambdaContext
        });
      }
      /**
       * It adds the given attributes (key-value pairs) to all log items generated by this Logger instance.
       *
       * @param {LogAttributes} attributes
       * @returns {void}
       */
      addPersistentLogAttributes(attributes) {
        (0, lodash_merge_1.default)(this.persistentLogAttributes, attributes);
      }
      /**
       * Alias for addPersistentLogAttributes.
       *
       * @param {LogAttributes} attributes
       * @returns {void}
       */
      appendKeys(attributes) {
        this.addPersistentLogAttributes(attributes);
      }
      /**
       * It creates a separate Logger instance, identical to the current one
       * It's possible to overwrite the new instance options by passing them.
       *
       * @param {ConstructorOptions} options
       * @returns {Logger}
       */
      createChild(options = {}) {
        const parentsOptions = {
          logLevel: this.getLevelName(),
          customConfigService: this.getCustomConfigService(),
          logFormatter: this.getLogFormatter()
        };
        const parentsPowertoolsLogData = this.getPowertoolLogData();
        const childLogger = this.createLogger((0, lodash_merge_1.default)(parentsOptions, parentsPowertoolsLogData, options));
        const parentsPersistentLogAttributes = this.getPersistentLogAttributes();
        childLogger.addPersistentLogAttributes(parentsPersistentLogAttributes);
        if (parentsPowertoolsLogData.lambdaContext) {
          childLogger.addContext(parentsPowertoolsLogData.lambdaContext);
        }
        return childLogger;
      }
      /**
       * It prints a log item with level CRITICAL.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       */
      critical(input, ...extraInput) {
        this.processLogItem(24, input, extraInput);
      }
      /**
       * It prints a log item with level DEBUG.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      debug(input, ...extraInput) {
        this.processLogItem(8, input, extraInput);
      }
      /**
       * It prints a log item with level ERROR.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      error(input, ...extraInput) {
        this.processLogItem(20, input, extraInput);
      }
      /**
       * Get the log level name of the current instance of Logger.
       *
       * It returns the log level name, i.e. `INFO`, `DEBUG`, etc.
       * To get the log level as a number, use the {@link Logger.level} property.
       *
       * @returns {Uppercase<LogLevel>} The log level name.
       */
      getLevelName() {
        return this.getLogLevelNameFromNumber(this.logLevel);
      }
      /**
       * It returns a boolean value. True means that the Lambda invocation events
       * are printed in the logs.
       *
       * @returns {boolean}
       */
      getLogEvent() {
        return this.logEvent;
      }
      /**
       * It returns a boolean value, if true all the logs will be printed.
       *
       * @returns {boolean}
       */
      getLogsSampled() {
        return this.logsSampled;
      }
      /**
       * It returns the persistent log attributes, which are the attributes
       * that will be logged in all log items.
       *
       * @private
       * @returns {LogAttributes}
       */
      getPersistentLogAttributes() {
        return this.persistentLogAttributes;
      }
      /**
       * It prints a log item with level INFO.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      info(input, ...extraInput) {
        this.processLogItem(12, input, extraInput);
      }
      /**
       * Method decorator that adds the current Lambda function context as extra
       * information in all log items.
       *
       * The decorator can be used only when attached to a Lambda function handler which
       * is written as method of a class, and should be declared just before the handler declaration.
       *
       * Note: Currently TypeScript only supports decorators on classes and methods. If you are using the
       * function syntax, you should use the middleware instead.
       *
       * @example
       * ```typescript
       * import { Logger } from '@aws-lambda-powertools/logger';
       * import { LambdaInterface } from '@aws-lambda-powertools/commons';
       *
       * const logger = new Logger();
       *
       * class Lambda implements LambdaInterface {
       *     // Decorate your handler class method
       *     ⁣@logger.injectLambdaContext()
       *     public async handler(_event: unknown, _context: unknown): Promise<void> {
       *         logger.info('This is an INFO log with some context');
       *     }
       * }
       *
       * const handlerClass = new Lambda();
       * export const handler = handlerClass.handler.bind(handlerClass);
       * ```
       *
       * @see https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
       * @returns {HandlerMethodDecorator}
       */
      injectLambdaContext(options) {
        return (_target, _propertyKey, descriptor) => {
          const originalMethod = descriptor.value;
          const loggerRef = this;
          descriptor.value = async function(event, context, callback) {
            let initialPersistentAttributes = {};
            if (options && options.clearState === true) {
              initialPersistentAttributes = {
                ...loggerRef.getPersistentLogAttributes()
              };
            }
            Logger2.injectLambdaContextBefore(loggerRef, event, context, options);
            let result;
            try {
              result = await originalMethod.apply(this, [event, context, callback]);
            } catch (error) {
              throw error;
            } finally {
              Logger2.injectLambdaContextAfterOrOnError(loggerRef, initialPersistentAttributes, options);
            }
            return result;
          };
        };
      }
      static injectLambdaContextAfterOrOnError(logger2, initialPersistentAttributes, options) {
        if (options && options.clearState === true) {
          logger2.setPersistentLogAttributes(initialPersistentAttributes);
        }
      }
      static injectLambdaContextBefore(logger2, event, context, options) {
        logger2.addContext(context);
        let shouldLogEvent = void 0;
        if (options && options.hasOwnProperty("logEvent")) {
          shouldLogEvent = options.logEvent;
        }
        logger2.logEventIfEnabled(event, shouldLogEvent);
      }
      /**
       * Logs a Lambda invocation event, if it *should*.
       *
       ** @param {unknown} event
       * @param {boolean} [overwriteValue]
       * @returns {void}
       */
      logEventIfEnabled(event, overwriteValue) {
        if (!this.shouldLogEvent(overwriteValue)) {
          return;
        }
        this.info("Lambda invocation event", { event });
      }
      /**
       * If the sample rate feature is enabled, the calculation that determines whether the logs
       * will actually be printed or not for this invocation is done when the Logger class is
       * initialized.
       * This method will repeat that calculation (with possible different outcome).
       *
       * @returns {void}
       */
      refreshSampleRateCalculation() {
        this.setLogsSampled();
      }
      /**
       * Alias for removePersistentLogAttributes.
       *
       * @param {string[]} keys
       * @returns {void}
       */
      removeKeys(keys) {
        this.removePersistentLogAttributes(keys);
      }
      /**
       * It removes attributes based on provided keys to all log items generated by this Logger instance.
       *
       * @param {string[]} keys
       * @returns {void}
       */
      removePersistentLogAttributes(keys) {
        keys.forEach((key) => {
          if (this.persistentLogAttributes && key in this.persistentLogAttributes) {
            delete this.persistentLogAttributes[key];
          }
        });
      }
      /**
       * Set the log level for this Logger instance.
       *
       * If the log level is set using AWS Lambda Advanced Logging Controls, it sets it
       * instead of the given log level to avoid data loss.
       *
       * @param logLevel The log level to set, i.e. `error`, `warn`, `info`, `debug`, etc.
       */
      setLogLevel(logLevel) {
        if (this.awsLogLevelShortCircuit(logLevel))
          return;
        if (this.isValidLogLevel(logLevel)) {
          this.logLevel = this.logLevelThresholds[logLevel];
        } else {
          throw new Error(`Invalid log level: ${logLevel}`);
        }
      }
      /**
       * It sets the given attributes (key-value pairs) to all log items generated by this Logger instance.
       * Note: this replaces the pre-existing value.
       *
       * @param {LogAttributes} attributes
       * @returns {void}
       */
      setPersistentLogAttributes(attributes) {
        this.persistentLogAttributes = attributes;
      }
      /**
       * It sets the user-provided sample rate value.
       *
       * @param {number} [sampleRateValue]
       * @returns {void}
       */
      setSampleRateValue(sampleRateValue) {
        this.powertoolLogData.sampleRateValue = sampleRateValue || this.getCustomConfigService()?.getSampleRateValue() || this.getEnvVarsService().getSampleRateValue();
      }
      /**
       * It checks whether the current Lambda invocation event should be printed in the logs or not.
       *
       * @private
       * @param {boolean} [overwriteValue]
       * @returns {boolean}
       */
      shouldLogEvent(overwriteValue) {
        if (typeof overwriteValue === "boolean") {
          return overwriteValue;
        }
        return this.getLogEvent();
      }
      /**
       * It prints a log item with level WARN.
       *
       * @param {LogItemMessage} input
       * @param {Error | LogAttributes | string} extraInput
       * @returns {void}
       */
      warn(input, ...extraInput) {
        this.processLogItem(16, input, extraInput);
      }
      /**
       * Creates a new Logger instance.
       *
       * @param {ConstructorOptions} [options]
       * @returns {Logger}
       */
      createLogger(options) {
        return new Logger2(options);
      }
      /**
       * Decides whether the current log item should be printed or not.
       *
       * The decision is based on the log level and the sample rate value.
       * A log item will be printed if:
       * 1. The log level is greater than or equal to the Logger's log level.
       * 2. The log level is less than the Logger's log level, but the
       * current sampling value is set to `true`.
       *
       * @param {number} logLevel
       * @returns {boolean}
       * @protected
       */
      shouldPrint(logLevel) {
        if (logLevel >= this.logLevel) {
          return true;
        }
        return this.getLogsSampled();
      }
      /**
       * It stores information that is printed in all log items.
       *
       * @param {Partial<PowertoolLogData>} attributesArray
       * @private
       * @returns {void}
       */
      addToPowertoolLogData(...attributesArray) {
        attributesArray.forEach((attributes) => {
          (0, lodash_merge_1.default)(this.powertoolLogData, attributes);
        });
      }
      awsLogLevelShortCircuit(selectedLogLevel) {
        const awsLogLevel = this.getEnvVarsService().getAwsLogLevel();
        if (this.isValidLogLevel(awsLogLevel)) {
          this.logLevel = this.logLevelThresholds[awsLogLevel];
          if (this.isValidLogLevel(selectedLogLevel) && this.logLevel > this.logLevelThresholds[selectedLogLevel]) {
            this.warn((0, node_util_1.format)(`Current log level (%s) does not match AWS Lambda Advanced Logging Controls minimum log level (%s). This can lead to data loss, consider adjusting them.`, selectedLogLevel, awsLogLevel));
          }
          return true;
        }
        return false;
      }
      /**
       * It processes a particular log item so that it can be printed to stdout:
       * - Merges ephemeral log attributes with persistent log attributes (printed for all logs) and additional info;
       * - Formats all the log attributes;
       *
       * @private
       * @param {number} logLevel
       * @param {LogItemMessage} input
       * @param {LogItemExtraInput} extraInput
       * @returns {LogItem}
       */
      createAndPopulateLogItem(logLevel, input, extraInput) {
        const unformattedBaseAttributes = (0, lodash_merge_1.default)({
          logLevel: this.getLogLevelNameFromNumber(logLevel),
          timestamp: /* @__PURE__ */ new Date(),
          message: typeof input === "string" ? input : input.message,
          xRayTraceId: this.envVarsService.getXrayTraceId()
        }, this.getPowertoolLogData());
        const logItem = new log_1.LogItem({
          baseAttributes: this.getLogFormatter().formatAttributes(unformattedBaseAttributes),
          persistentAttributes: this.getPersistentLogAttributes()
        });
        if (typeof input !== "string") {
          logItem.addAttributes(input);
        }
        extraInput.forEach((item) => {
          const attributes = item instanceof Error ? { error: item } : typeof item === "string" ? { extra: item } : item;
          logItem.addAttributes(attributes);
        });
        return logItem;
      }
      /**
       * It returns the custom config service, an abstraction used to fetch environment variables.
       *
       * @private
       * @returns {ConfigServiceInterface | undefined}
       */
      getCustomConfigService() {
        return this.customConfigService;
      }
      /**
       * It returns the instance of a service that fetches environment variables.
       *
       * @private
       * @returns {EnvironmentVariablesService}
       */
      getEnvVarsService() {
        return this.envVarsService;
      }
      /**
       * It returns the instance of a service that formats the structure of a
       * log item's keys and values in the desired way.
       *
       * @private
       * @returns {LogFormatterInterface}
       */
      getLogFormatter() {
        return this.logFormatter;
      }
      /**
       * Get the log level name from the log level number.
       *
       * For example, if the log level is 16, it will return 'WARN'.
       *
       * @param logLevel - The log level to get the name of
       * @returns - The name of the log level
       */
      getLogLevelNameFromNumber(logLevel) {
        const found = Object.entries(this.logLevelThresholds).find(([key, value]) => {
          if (value === logLevel) {
            return key;
          }
        });
        return found[0];
      }
      /**
       * It returns information that will be added in all log item by
       * this Logger instance (different from user-provided persistent attributes).
       *
       * @private
       * @returns {LogAttributes}
       */
      getPowertoolLogData() {
        return this.powertoolLogData;
      }
      /**
       * When the data added in the log item contains object references or BigInt values,
       * `JSON.stringify()` can't handle them and instead throws errors:
       * `TypeError: cyclic object value` or `TypeError: Do not know how to serialize a BigInt`.
       * To mitigate these issues, this method will find and remove all cyclic references and convert BigInt values to strings.
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#exceptions
       * @private
       */
      getReplacer() {
        const references = /* @__PURE__ */ new WeakSet();
        return (key, value) => {
          let item = value;
          if (item instanceof Error) {
            item = this.getLogFormatter().formatError(item);
          }
          if (typeof item === "bigint") {
            return item.toString();
          }
          if (typeof item === "object" && value !== null) {
            if (references.has(item)) {
              return;
            }
            references.add(item);
          }
          return item;
        };
      }
      /**
       * It returns the numeric sample rate value.
       *
       * @private
       * @returns {number}
       */
      getSampleRateValue() {
        if (!this.powertoolLogData.sampleRateValue) {
          this.setSampleRateValue();
        }
        return this.powertoolLogData.sampleRateValue;
      }
      /**
       * It returns true and type guards the log level if a given log level is valid.
       *
       * @param {LogLevel} logLevel
       * @private
       * @returns {boolean}
       */
      isValidLogLevel(logLevel) {
        return typeof logLevel === "string" && logLevel in this.logLevelThresholds;
      }
      /**
       * It prints a given log with given log level.
       *
       * @param {number} logLevel
       * @param {LogItem} log
       * @private
       */
      printLog(logLevel, log) {
        log.prepareForPrint();
        const consoleMethod = logLevel === 24 ? "error" : this.getLogLevelNameFromNumber(logLevel).toLowerCase();
        this.console[consoleMethod](JSON.stringify(log.getAttributes(), this.getReplacer(), this.logIndentation));
      }
      /**
       * It prints a given log with given log level.
       *
       * @param {number} logLevel
       * @param {LogItemMessage} input
       * @param {LogItemExtraInput} extraInput
       * @private
       */
      processLogItem(logLevel, input, extraInput) {
        if (!this.shouldPrint(logLevel)) {
          return;
        }
        this.printLog(logLevel, this.createAndPopulateLogItem(logLevel, input, extraInput));
      }
      /**
       * It initializes console property as an instance of the internal version of Console() class (PR #748)
       * or as the global node console if the `POWERTOOLS_DEV' env variable is set and has truthy value.
       *
       * @private
       * @returns {void}
       */
      setConsole() {
        if (!this.getEnvVarsService().isDevMode()) {
          this.console = new node_console_1.Console({
            stdout: process.stdout,
            stderr: process.stderr
          });
        } else {
          this.console = console;
        }
      }
      /**
       * Sets the Logger's customer config service instance, which will be used
       * to fetch environment variables.
       *
       * @private
       * @param {ConfigServiceInterface} customConfigService
       * @returns {void}
       */
      setCustomConfigService(customConfigService) {
        this.customConfigService = customConfigService ? customConfigService : void 0;
      }
      /**
       * Sets the Logger's custom config service instance, which will be used
       * to fetch environment variables.
       *
       * @private
       * @returns {void}
       */
      setEnvVarsService() {
        this.envVarsService = new config_1.EnvironmentVariablesService();
      }
      /**
       * Sets the initial Logger log level based on the following order:
       * 1. If a log level is set using AWS Lambda Advanced Logging Controls, it sets it.
       * 2. If a log level is passed to the constructor, it sets it.
       * 3. If a log level is set via custom config service, it sets it.
       * 4. If a log level is set via env variables, it sets it.
       *
       * If none of the above is true, the default log level applies (`INFO`).
       *
       * @private
       * @param {LogLevel} [logLevel] - Log level passed to the constructor
       */
      setInitialLogLevel(logLevel) {
        const constructorLogLevel = logLevel?.toUpperCase();
        if (this.awsLogLevelShortCircuit(constructorLogLevel))
          return;
        if (this.isValidLogLevel(constructorLogLevel)) {
          this.logLevel = this.logLevelThresholds[constructorLogLevel];
          return;
        }
        const customConfigValue = this.getCustomConfigService()?.getLogLevel()?.toUpperCase();
        if (this.isValidLogLevel(customConfigValue)) {
          this.logLevel = this.logLevelThresholds[customConfigValue];
          return;
        }
        const envVarsValue = this.getEnvVarsService()?.getLogLevel()?.toUpperCase();
        if (this.isValidLogLevel(envVarsValue)) {
          this.logLevel = this.logLevelThresholds[envVarsValue];
          return;
        }
      }
      /**
       * If the log event feature is enabled via env variable, it sets a property that tracks whether
       * the event passed to the Lambda function handler should be logged or not.
       *
       * @private
       * @returns {void}
       */
      setLogEvent() {
        if (this.getEnvVarsService().getLogEvent()) {
          this.logEvent = true;
        }
      }
      /**
       * It sets the log formatter instance, in charge of giving a custom format
       * to the structured logs
       *
       * @private
       * @param {LogFormatterInterface} logFormatter
       * @returns {void}
       */
      setLogFormatter(logFormatter) {
        this.logFormatter = logFormatter || new formatter_1.PowertoolLogFormatter();
      }
      /**
       * If the `POWERTOOLS_DEV' env variable is set,
       * it adds JSON indentation for pretty printing logs.
       *
       * @private
       * @returns {void}
       */
      setLogIndentation() {
        if (this.getEnvVarsService().isDevMode()) {
          this.logIndentation = 4;
        }
      }
      /**
       * If the sample rate feature is enabled, it sets a property that tracks whether this Lambda function invocation
       * will print logs or not.
       *
       * @private
       * @returns {void}
       */
      setLogsSampled() {
        const sampleRateValue = this.getSampleRateValue();
        this.logsSampled = sampleRateValue !== void 0 && (sampleRateValue === 1 || (0, node_crypto_1.randomInt)(0, 100) / 100 <= sampleRateValue);
      }
      /**
       * It configures the Logger instance settings that will affect the Logger's behaviour
       * and the content of all logs.
       *
       * @private
       * @param {ConstructorOptions} options
       * @returns {Logger}
       */
      setOptions(options) {
        const { logLevel, serviceName, sampleRateValue, logFormatter, customConfigService, persistentLogAttributes, environment } = options;
        this.setEnvVarsService();
        this.setConsole();
        this.setCustomConfigService(customConfigService);
        this.setInitialLogLevel(logLevel);
        this.setSampleRateValue(sampleRateValue);
        this.setLogsSampled();
        this.setLogFormatter(logFormatter);
        this.setPowertoolLogData(serviceName, environment);
        this.setLogEvent();
        this.setLogIndentation();
        this.addPersistentLogAttributes(persistentLogAttributes);
        return this;
      }
      /**
       * It adds important data to the Logger instance that will affect the content of all logs.
       *
       * @param {string} serviceName
       * @param {Environment} environment
       * @param {LogAttributes} persistentLogAttributes
       * @private
       * @returns {void}
       */
      setPowertoolLogData(serviceName, environment, persistentLogAttributes = {}) {
        this.addToPowertoolLogData({
          awsRegion: this.getEnvVarsService().getAwsRegion(),
          environment: environment || this.getCustomConfigService()?.getCurrentEnvironment() || this.getEnvVarsService().getCurrentEnvironment(),
          sampleRateValue: this.getSampleRateValue(),
          serviceName: serviceName || this.getCustomConfigService()?.getServiceName() || this.getEnvVarsService().getServiceName() || this.getDefaultServiceName()
        }, persistentLogAttributes);
      }
    };
    exports.Logger = Logger2;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/middleware/middy.js
var require_middy3 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/middleware/middy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.injectLambdaContext = void 0;
    var Logger_1 = require_Logger();
    var middleware_1 = require_middleware();
    var injectLambdaContext = (target, options) => {
      const loggers = target instanceof Array ? target : [target];
      const persistentAttributes = [];
      const isClearState = options && options.clearState === true;
      const setCleanupFunction = (request) => {
        request.internal = {
          ...request.internal,
          [middleware_1.LOGGER_KEY]: injectLambdaContextAfterOrOnError
        };
      };
      const injectLambdaContextBefore = async (request) => {
        loggers.forEach((logger2, index) => {
          if (isClearState) {
            persistentAttributes[index] = {
              ...logger2.getPersistentLogAttributes()
            };
            setCleanupFunction(request);
          }
          Logger_1.Logger.injectLambdaContextBefore(logger2, request.event, request.context, options);
        });
      };
      const injectLambdaContextAfterOrOnError = async () => {
        if (isClearState) {
          loggers.forEach((logger2, index) => {
            Logger_1.Logger.injectLambdaContextAfterOrOnError(logger2, persistentAttributes[index], options);
          });
        }
      };
      return {
        before: injectLambdaContextBefore,
        after: injectLambdaContextAfterOrOnError,
        onError: injectLambdaContextAfterOrOnError
      };
    };
    exports.injectLambdaContext = injectLambdaContext;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/middleware/index.js
var require_middleware3 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/middleware/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_middy3(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/index.js
var require_lib3 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+logger@1.17.0/node_modules/@aws-lambda-powertools/logger/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_helpers(), exports);
    __exportStar(require_Logger(), exports);
    __exportStar(require_middleware3(), exports);
    __exportStar(require_formatter(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/helpers.js
var require_helpers2 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/helpers.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createTracer = void 0;
    var _1 = require_lib5();
    var createTracer = (options = {}) => new _1.Tracer(options);
    exports.createTracer = createTracer;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/config/ConfigServiceInterface.js
var require_ConfigServiceInterface3 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/config/ConfigServiceInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/config/EnvironmentVariablesService.js
var require_EnvironmentVariablesService4 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/config/EnvironmentVariablesService.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnvironmentVariablesService = void 0;
    var commons_1 = require_lib();
    var EnvironmentVariablesService = class extends commons_1.EnvironmentVariablesService {
      constructor() {
        super(...arguments);
        this.awsExecutionEnv = "AWS_EXECUTION_ENV";
        this.samLocalVariable = "AWS_SAM_LOCAL";
        this.tracerCaptureErrorVariable = "POWERTOOLS_TRACER_CAPTURE_ERROR";
        this.tracerCaptureHTTPsRequestsVariable = "POWERTOOLS_TRACER_CAPTURE_HTTPS_REQUESTS";
        this.tracerCaptureResponseVariable = "POWERTOOLS_TRACER_CAPTURE_RESPONSE";
        this.tracingEnabledVariable = "POWERTOOLS_TRACE_ENABLED";
      }
      getAwsExecutionEnv() {
        return this.get(this.awsExecutionEnv);
      }
      getCaptureHTTPsRequests() {
        return this.get(this.tracerCaptureHTTPsRequestsVariable);
      }
      getSamLocal() {
        return this.get(this.samLocalVariable);
      }
      getTracingCaptureError() {
        return this.get(this.tracerCaptureErrorVariable);
      }
      getTracingCaptureResponse() {
        return this.get(this.tracerCaptureResponseVariable);
      }
      getTracingEnabled() {
        return this.get(this.tracingEnabledVariable);
      }
    };
    exports.EnvironmentVariablesService = EnvironmentVariablesService;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/config/index.js
var require_config4 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/config/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_ConfigServiceInterface3(), exports);
    __exportStar(require_EnvironmentVariablesService4(), exports);
  }
});

// ../node_modules/.pnpm/shimmer@1.2.1/node_modules/shimmer/index.js
var require_shimmer = __commonJS({
  "../node_modules/.pnpm/shimmer@1.2.1/node_modules/shimmer/index.js"(exports, module2) {
    "use strict";
    function isFunction(funktion) {
      return typeof funktion === "function";
    }
    var logger2 = console.error.bind(console);
    function defineProperty(obj, name, value) {
      var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
      Object.defineProperty(obj, name, {
        configurable: true,
        enumerable,
        writable: true,
        value
      });
    }
    function shimmer(options) {
      if (options && options.logger) {
        if (!isFunction(options.logger))
          logger2("new logger isn't a function, not replacing");
        else
          logger2 = options.logger;
      }
    }
    function wrap(nodule, name, wrapper) {
      if (!nodule || !nodule[name]) {
        logger2("no original function " + name + " to wrap");
        return;
      }
      if (!wrapper) {
        logger2("no wrapper function");
        logger2(new Error().stack);
        return;
      }
      if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
        logger2("original object and wrapper must be functions");
        return;
      }
      var original = nodule[name];
      var wrapped = wrapper(original, name);
      defineProperty(wrapped, "__original", original);
      defineProperty(wrapped, "__unwrap", function() {
        if (nodule[name] === wrapped)
          defineProperty(nodule, name, original);
      });
      defineProperty(wrapped, "__wrapped", true);
      defineProperty(nodule, name, wrapped);
      return wrapped;
    }
    function massWrap(nodules, names, wrapper) {
      if (!nodules) {
        logger2("must provide one or more modules to patch");
        logger2(new Error().stack);
        return;
      } else if (!Array.isArray(nodules)) {
        nodules = [nodules];
      }
      if (!(names && Array.isArray(names))) {
        logger2("must provide one or more functions to wrap on modules");
        return;
      }
      nodules.forEach(function(nodule) {
        names.forEach(function(name) {
          wrap(nodule, name, wrapper);
        });
      });
    }
    function unwrap(nodule, name) {
      if (!nodule || !nodule[name]) {
        logger2("no function to unwrap.");
        logger2(new Error().stack);
        return;
      }
      if (!nodule[name].__unwrap) {
        logger2("no original to unwrap to -- has " + name + " already been unwrapped?");
      } else {
        return nodule[name].__unwrap();
      }
    }
    function massUnwrap(nodules, names) {
      if (!nodules) {
        logger2("must provide one or more modules to patch");
        logger2(new Error().stack);
        return;
      } else if (!Array.isArray(nodules)) {
        nodules = [nodules];
      }
      if (!(names && Array.isArray(names))) {
        logger2("must provide one or more functions to unwrap on modules");
        return;
      }
      nodules.forEach(function(nodule) {
        names.forEach(function(name) {
          unwrap(nodule, name);
        });
      });
    }
    shimmer.wrap = wrap;
    shimmer.massWrap = massWrap;
    shimmer.unwrap = unwrap;
    shimmer.massUnwrap = massUnwrap;
    module2.exports = shimmer;
  }
});

// ../node_modules/.pnpm/emitter-listener@1.1.2/node_modules/emitter-listener/listener.js
var require_listener = __commonJS({
  "../node_modules/.pnpm/emitter-listener@1.1.2/node_modules/emitter-listener/listener.js"(exports, module2) {
    "use strict";
    var shimmer = require_shimmer();
    var wrap = shimmer.wrap;
    var unwrap = shimmer.unwrap;
    var SYMBOL = "wrap@before";
    function defineProperty(obj, name, value) {
      var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
      Object.defineProperty(obj, name, {
        configurable: true,
        enumerable,
        writable: true,
        value
      });
    }
    function _process(self2, listeners) {
      var l = listeners.length;
      for (var p = 0; p < l; p++) {
        var listener = listeners[p];
        var before = self2[SYMBOL];
        if (typeof before === "function") {
          before(listener);
        } else if (Array.isArray(before)) {
          var length = before.length;
          for (var i = 0; i < length; i++)
            before[i](listener);
        }
      }
    }
    function _listeners(self2, event) {
      var listeners;
      listeners = self2._events && self2._events[event];
      if (!Array.isArray(listeners)) {
        if (listeners) {
          listeners = [listeners];
        } else {
          listeners = [];
        }
      }
      return listeners;
    }
    function _findAndProcess(self2, event, before) {
      var after = _listeners(self2, event);
      var unprocessed = after.filter(function(fn) {
        return before.indexOf(fn) === -1;
      });
      if (unprocessed.length > 0)
        _process(self2, unprocessed);
    }
    function _wrap(unwrapped, visit) {
      if (!unwrapped)
        return;
      var wrapped = unwrapped;
      if (typeof unwrapped === "function") {
        wrapped = visit(unwrapped);
      } else if (Array.isArray(unwrapped)) {
        wrapped = [];
        for (var i = 0; i < unwrapped.length; i++) {
          wrapped[i] = visit(unwrapped[i]);
        }
      }
      return wrapped;
    }
    module2.exports = function wrapEmitter(emitter, onAddListener, onEmit) {
      if (!emitter || !emitter.on || !emitter.addListener || !emitter.removeListener || !emitter.emit) {
        throw new Error("can only wrap real EEs");
      }
      if (!onAddListener)
        throw new Error("must have function to run on listener addition");
      if (!onEmit)
        throw new Error("must have function to wrap listeners when emitting");
      function adding(on) {
        return function added(event, listener) {
          var existing = _listeners(this, event).slice();
          try {
            var returned = on.call(this, event, listener);
            _findAndProcess(this, event, existing);
            return returned;
          } finally {
            if (!this.on.__wrapped)
              wrap(this, "on", adding);
            if (!this.addListener.__wrapped)
              wrap(this, "addListener", adding);
          }
        };
      }
      function emitting(emit) {
        return function emitted(event) {
          if (!this._events || !this._events[event])
            return emit.apply(this, arguments);
          var unwrapped = this._events[event];
          function remover(removeListener) {
            return function removed() {
              this._events[event] = unwrapped;
              try {
                return removeListener.apply(this, arguments);
              } finally {
                unwrapped = this._events[event];
                this._events[event] = _wrap(unwrapped, onEmit);
              }
            };
          }
          wrap(this, "removeListener", remover);
          try {
            this._events[event] = _wrap(unwrapped, onEmit);
            return emit.apply(this, arguments);
          } finally {
            unwrap(this, "removeListener");
            this._events[event] = unwrapped;
          }
        };
      }
      if (!emitter[SYMBOL]) {
        defineProperty(emitter, SYMBOL, onAddListener);
      } else if (typeof emitter[SYMBOL] === "function") {
        defineProperty(emitter, SYMBOL, [emitter[SYMBOL], onAddListener]);
      } else if (Array.isArray(emitter[SYMBOL])) {
        emitter[SYMBOL].push(onAddListener);
      }
      if (!emitter.__wrapped) {
        wrap(emitter, "addListener", adding);
        wrap(emitter, "on", adding);
        wrap(emitter, "emit", emitting);
        defineProperty(emitter, "__unwrap", function() {
          unwrap(emitter, "addListener");
          unwrap(emitter, "on");
          unwrap(emitter, "emit");
          delete emitter[SYMBOL];
          delete emitter.__wrapped;
        });
        defineProperty(emitter, "__wrapped", true);
      }
    };
  }
});

// ../node_modules/.pnpm/cls-hooked@4.2.2/node_modules/cls-hooked/context.js
var require_context = __commonJS({
  "../node_modules/.pnpm/cls-hooked@4.2.2/node_modules/cls-hooked/context.js"(exports, module2) {
    "use strict";
    var util = require("util");
    var assert = require("assert");
    var wrapEmitter = require_listener();
    var async_hooks = require("async_hooks");
    var CONTEXTS_SYMBOL = "cls@contexts";
    var ERROR_SYMBOL = "error@context";
    var DEBUG_CLS_HOOKED = process.env.DEBUG_CLS_HOOKED;
    var currentUid = -1;
    module2.exports = {
      getNamespace,
      createNamespace,
      destroyNamespace,
      reset,
      ERROR_SYMBOL
    };
    function Namespace(name) {
      this.name = name;
      this.active = null;
      this._set = [];
      this.id = null;
      this._contexts = /* @__PURE__ */ new Map();
      this._indent = 0;
    }
    Namespace.prototype.set = function set(key, value) {
      if (!this.active) {
        throw new Error("No context available. ns.run() or ns.bind() must be called first.");
      }
      this.active[key] = value;
      if (DEBUG_CLS_HOOKED) {
        const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
        debug2(indentStr + "CONTEXT-SET KEY:" + key + "=" + value + " in ns:" + this.name + " currentUid:" + currentUid + " active:" + util.inspect(this.active, { showHidden: true, depth: 2, colors: true }));
      }
      return value;
    };
    Namespace.prototype.get = function get(key) {
      if (!this.active) {
        if (DEBUG_CLS_HOOKED) {
          const asyncHooksCurrentId = async_hooks.currentId();
          const triggerId = async_hooks.triggerAsyncId();
          const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
          debug2(`${indentStr}CONTEXT-GETTING KEY NO ACTIVE NS: (${this.name}) ${key}=undefined currentUid:${currentUid} asyncHooksCurrentId:${asyncHooksCurrentId} triggerId:${triggerId} len:${this._set.length}`);
        }
        return void 0;
      }
      if (DEBUG_CLS_HOOKED) {
        const asyncHooksCurrentId = async_hooks.executionAsyncId();
        const triggerId = async_hooks.triggerAsyncId();
        const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
        debug2(indentStr + "CONTEXT-GETTING KEY:" + key + "=" + this.active[key] + " (" + this.name + ") currentUid:" + currentUid + " active:" + util.inspect(this.active, { showHidden: true, depth: 2, colors: true }));
        debug2(`${indentStr}CONTEXT-GETTING KEY: (${this.name}) ${key}=${this.active[key]} currentUid:${currentUid} asyncHooksCurrentId:${asyncHooksCurrentId} triggerId:${triggerId} len:${this._set.length} active:${util.inspect(this.active)}`);
      }
      return this.active[key];
    };
    Namespace.prototype.createContext = function createContext() {
      let context = Object.create(this.active ? this.active : Object.prototype);
      context._ns_name = this.name;
      context.id = currentUid;
      if (DEBUG_CLS_HOOKED) {
        const asyncHooksCurrentId = async_hooks.executionAsyncId();
        const triggerId = async_hooks.triggerAsyncId();
        const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
        debug2(`${indentStr}CONTEXT-CREATED Context: (${this.name}) currentUid:${currentUid} asyncHooksCurrentId:${asyncHooksCurrentId} triggerId:${triggerId} len:${this._set.length} context:${util.inspect(context, { showHidden: true, depth: 2, colors: true })}`);
      }
      return context;
    };
    Namespace.prototype.run = function run(fn) {
      let context = this.createContext();
      this.enter(context);
      try {
        if (DEBUG_CLS_HOOKED) {
          const triggerId = async_hooks.triggerAsyncId();
          const asyncHooksCurrentId = async_hooks.executionAsyncId();
          const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
          debug2(`${indentStr}CONTEXT-RUN BEGIN: (${this.name}) currentUid:${currentUid} triggerId:${triggerId} asyncHooksCurrentId:${asyncHooksCurrentId} len:${this._set.length} context:${util.inspect(context)}`);
        }
        fn(context);
        return context;
      } catch (exception) {
        if (exception) {
          exception[ERROR_SYMBOL] = context;
        }
        throw exception;
      } finally {
        if (DEBUG_CLS_HOOKED) {
          const triggerId = async_hooks.triggerAsyncId();
          const asyncHooksCurrentId = async_hooks.executionAsyncId();
          const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
          debug2(`${indentStr}CONTEXT-RUN END: (${this.name}) currentUid:${currentUid} triggerId:${triggerId} asyncHooksCurrentId:${asyncHooksCurrentId} len:${this._set.length} ${util.inspect(context)}`);
        }
        this.exit(context);
      }
    };
    Namespace.prototype.runAndReturn = function runAndReturn(fn) {
      let value;
      this.run(function(context) {
        value = fn(context);
      });
      return value;
    };
    Namespace.prototype.runPromise = function runPromise(fn) {
      let context = this.createContext();
      this.enter(context);
      let promise = fn(context);
      if (!promise || !promise.then || !promise.catch) {
        throw new Error("fn must return a promise.");
      }
      if (DEBUG_CLS_HOOKED) {
        debug2("CONTEXT-runPromise BEFORE: (" + this.name + ") currentUid:" + currentUid + " len:" + this._set.length + " " + util.inspect(context));
      }
      return promise.then((result) => {
        if (DEBUG_CLS_HOOKED) {
          debug2("CONTEXT-runPromise AFTER then: (" + this.name + ") currentUid:" + currentUid + " len:" + this._set.length + " " + util.inspect(context));
        }
        this.exit(context);
        return result;
      }).catch((err) => {
        err[ERROR_SYMBOL] = context;
        if (DEBUG_CLS_HOOKED) {
          debug2("CONTEXT-runPromise AFTER catch: (" + this.name + ") currentUid:" + currentUid + " len:" + this._set.length + " " + util.inspect(context));
        }
        this.exit(context);
        throw err;
      });
    };
    Namespace.prototype.bind = function bindFactory(fn, context) {
      if (!context) {
        if (!this.active) {
          context = this.createContext();
        } else {
          context = this.active;
        }
      }
      let self2 = this;
      return function clsBind() {
        self2.enter(context);
        try {
          return fn.apply(this, arguments);
        } catch (exception) {
          if (exception) {
            exception[ERROR_SYMBOL] = context;
          }
          throw exception;
        } finally {
          self2.exit(context);
        }
      };
    };
    Namespace.prototype.enter = function enter(context) {
      assert.ok(context, "context must be provided for entering");
      if (DEBUG_CLS_HOOKED) {
        const asyncHooksCurrentId = async_hooks.executionAsyncId();
        const triggerId = async_hooks.triggerAsyncId();
        const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
        debug2(`${indentStr}CONTEXT-ENTER: (${this.name}) currentUid:${currentUid} triggerId:${triggerId} asyncHooksCurrentId:${asyncHooksCurrentId} len:${this._set.length} ${util.inspect(context)}`);
      }
      this._set.push(this.active);
      this.active = context;
    };
    Namespace.prototype.exit = function exit(context) {
      assert.ok(context, "context must be provided for exiting");
      if (DEBUG_CLS_HOOKED) {
        const asyncHooksCurrentId = async_hooks.executionAsyncId();
        const triggerId = async_hooks.triggerAsyncId();
        const indentStr = " ".repeat(this._indent < 0 ? 0 : this._indent);
        debug2(`${indentStr}CONTEXT-EXIT: (${this.name}) currentUid:${currentUid} triggerId:${triggerId} asyncHooksCurrentId:${asyncHooksCurrentId} len:${this._set.length} ${util.inspect(context)}`);
      }
      if (this.active === context) {
        assert.ok(this._set.length, "can't remove top context");
        this.active = this._set.pop();
        return;
      }
      let index = this._set.lastIndexOf(context);
      if (index < 0) {
        if (DEBUG_CLS_HOOKED) {
          debug2("??ERROR?? context exiting but not entered - ignoring: " + util.inspect(context));
        }
        assert.ok(index >= 0, "context not currently entered; can't exit. \n" + util.inspect(this) + "\n" + util.inspect(context));
      } else {
        assert.ok(index, "can't remove top context");
        this._set.splice(index, 1);
      }
    };
    Namespace.prototype.bindEmitter = function bindEmitter(emitter) {
      assert.ok(emitter.on && emitter.addListener && emitter.emit, "can only bind real EEs");
      let namespace = this;
      let thisSymbol = "context@" + this.name;
      function attach(listener) {
        if (!listener) {
          return;
        }
        if (!listener[CONTEXTS_SYMBOL]) {
          listener[CONTEXTS_SYMBOL] = /* @__PURE__ */ Object.create(null);
        }
        listener[CONTEXTS_SYMBOL][thisSymbol] = {
          namespace,
          context: namespace.active
        };
      }
      function bind(unwrapped) {
        if (!(unwrapped && unwrapped[CONTEXTS_SYMBOL])) {
          return unwrapped;
        }
        let wrapped = unwrapped;
        let unwrappedContexts = unwrapped[CONTEXTS_SYMBOL];
        Object.keys(unwrappedContexts).forEach(function(name) {
          let thunk = unwrappedContexts[name];
          wrapped = thunk.namespace.bind(wrapped, thunk.context);
        });
        return wrapped;
      }
      wrapEmitter(emitter, attach, bind);
    };
    Namespace.prototype.fromException = function fromException(exception) {
      return exception[ERROR_SYMBOL];
    };
    function getNamespace(name) {
      return process.namespaces[name];
    }
    function createNamespace(name) {
      assert.ok(name, "namespace must be given a name.");
      if (DEBUG_CLS_HOOKED) {
        debug2(`NS-CREATING NAMESPACE (${name})`);
      }
      let namespace = new Namespace(name);
      namespace.id = currentUid;
      const hook = async_hooks.createHook({
        init(asyncId, type, triggerId, resource) {
          currentUid = async_hooks.executionAsyncId();
          if (namespace.active) {
            namespace._contexts.set(asyncId, namespace.active);
            if (DEBUG_CLS_HOOKED) {
              const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
              debug2(`${indentStr}INIT [${type}] (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} resource:${resource}`);
            }
          } else if (currentUid === 0) {
            const triggerId2 = async_hooks.triggerAsyncId();
            const triggerIdContext = namespace._contexts.get(triggerId2);
            if (triggerIdContext) {
              namespace._contexts.set(asyncId, triggerIdContext);
              if (DEBUG_CLS_HOOKED) {
                const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
                debug2(`${indentStr}INIT USING CONTEXT FROM TRIGGERID [${type}] (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId2} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} resource:${resource}`);
              }
            } else if (DEBUG_CLS_HOOKED) {
              const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
              debug2(`${indentStr}INIT MISSING CONTEXT [${type}] (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId2} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} resource:${resource}`);
            }
          }
          if (DEBUG_CLS_HOOKED && type === "PROMISE") {
            debug2(util.inspect(resource, { showHidden: true }));
            const parentId = resource.parentId;
            const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
            debug2(`${indentStr}INIT RESOURCE-PROMISE [${type}] (${name}) parentId:${parentId} asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} resource:${resource}`);
          }
        },
        before(asyncId) {
          currentUid = async_hooks.executionAsyncId();
          let context;
          context = namespace._contexts.get(asyncId) || namespace._contexts.get(currentUid);
          if (context) {
            if (DEBUG_CLS_HOOKED) {
              const triggerId = async_hooks.triggerAsyncId();
              const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
              debug2(`${indentStr}BEFORE (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} context:${util.inspect(context)}`);
              namespace._indent += 2;
            }
            namespace.enter(context);
          } else if (DEBUG_CLS_HOOKED) {
            const triggerId = async_hooks.triggerAsyncId();
            const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
            debug2(`${indentStr}BEFORE MISSING CONTEXT (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} namespace._contexts:${util.inspect(namespace._contexts, { showHidden: true, depth: 2, colors: true })}`);
            namespace._indent += 2;
          }
        },
        after(asyncId) {
          currentUid = async_hooks.executionAsyncId();
          let context;
          context = namespace._contexts.get(asyncId) || namespace._contexts.get(currentUid);
          if (context) {
            if (DEBUG_CLS_HOOKED) {
              const triggerId = async_hooks.triggerAsyncId();
              namespace._indent -= 2;
              const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
              debug2(`${indentStr}AFTER (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} context:${util.inspect(context)}`);
            }
            namespace.exit(context);
          } else if (DEBUG_CLS_HOOKED) {
            const triggerId = async_hooks.triggerAsyncId();
            namespace._indent -= 2;
            const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
            debug2(`${indentStr}AFTER MISSING CONTEXT (${name}) asyncId:${asyncId} currentUid:${currentUid} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} context:${util.inspect(context)}`);
          }
        },
        destroy(asyncId) {
          currentUid = async_hooks.executionAsyncId();
          if (DEBUG_CLS_HOOKED) {
            const triggerId = async_hooks.triggerAsyncId();
            const indentStr = " ".repeat(namespace._indent < 0 ? 0 : namespace._indent);
            debug2(`${indentStr}DESTROY (${name}) currentUid:${currentUid} asyncId:${asyncId} triggerId:${triggerId} active:${util.inspect(namespace.active, { showHidden: true, depth: 2, colors: true })} context:${util.inspect(namespace._contexts.get(currentUid))}`);
          }
          namespace._contexts.delete(asyncId);
        }
      });
      hook.enable();
      process.namespaces[name] = namespace;
      return namespace;
    }
    function destroyNamespace(name) {
      let namespace = getNamespace(name);
      assert.ok(namespace, `can't delete nonexistent namespace! "` + name + '"');
      assert.ok(namespace.id, "don't assign to process.namespaces directly! " + util.inspect(namespace));
      process.namespaces[name] = null;
    }
    function reset() {
      if (process.namespaces) {
        Object.keys(process.namespaces).forEach(function(name) {
          destroyNamespace(name);
        });
      }
      process.namespaces = /* @__PURE__ */ Object.create(null);
    }
    process.namespaces = {};
    function debug2(...args) {
      if (DEBUG_CLS_HOOKED) {
        process._rawDebug(`${util.format(...args)}`);
      }
    }
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/logger.js
var require_logger = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/logger.js"(exports, module2) {
    "use strict";
    var validLogLevels = ["debug", "info", "warn", "error", "silent"];
    var defaultLogLevel = validLogLevels.indexOf("error");
    var logLevel = calculateLogLevel(process.env.AWS_XRAY_DEBUG_MODE ? "debug" : process.env.AWS_XRAY_LOG_LEVEL);
    var logger2 = {
      error: createLoggerForLevel("error"),
      info: createLoggerForLevel("info"),
      warn: createLoggerForLevel("warn"),
      debug: createLoggerForLevel("debug")
    };
    function createLoggerForLevel(level) {
      var loggerLevel = validLogLevels.indexOf(level);
      var consoleMethod = console[level] || console.log || (() => {
      });
      if (loggerLevel >= logLevel) {
        return (message, meta) => {
          if (message || meta) {
            consoleMethod(formatLogMessage(level, message, meta));
          }
        };
      } else {
        return () => {
        };
      }
    }
    function calculateLogLevel(level) {
      if (level) {
        var normalisedLevel = level.toLowerCase();
        var index = validLogLevels.indexOf(normalisedLevel);
        return index >= 0 ? index : defaultLogLevel;
      }
      return defaultLogLevel;
    }
    function createTimestamp(date) {
      var tzo = -date.getTimezoneOffset(), dif = tzo >= 0 ? "+" : "-", pad = function(num) {
        var norm = Math.floor(Math.abs(num));
        return (norm < 10 ? "0" : "") + norm;
      };
      return new Date(date.getTime() + tzo * 60 * 1e3).toISOString().replace(/T/, " ").replace(/Z/, " ") + dif + pad(tzo / 60) + ":" + pad(tzo % 60);
    }
    function isLambdaFunction() {
      return process.env.LAMBDA_TASK_ROOT !== void 0;
    }
    function formatLogMessage(level, message, meta) {
      var messageParts = [];
      if (!isLambdaFunction()) {
        messageParts.push(createTimestamp(/* @__PURE__ */ new Date()));
        messageParts.push(`[${level.toUpperCase()}]`);
      }
      if (message) {
        messageParts.push(message);
      }
      var logString = messageParts.join(" ");
      var metaDataString = formatMetaData(meta);
      return [logString, metaDataString].filter((str) => str.length > 0).join("\n  ");
    }
    function formatMetaData(meta) {
      if (!meta) {
        return "";
      }
      return typeof meta === "string" ? meta : JSON.stringify(meta);
    }
    var logging = {
      setLogger: function setLogger(logObj) {
        logger2 = logObj;
      },
      getLogger: function getLogger() {
        return logger2;
      }
    };
    module2.exports = logging;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/captured_exception.js
var require_captured_exception = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/captured_exception.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    function CapturedException(err, remote) {
      this.init(err, remote);
    }
    CapturedException.prototype.init = function init(err, remote) {
      var e = typeof err === "string" || err instanceof String ? { message: err, name: "" } : err;
      this.message = e.message;
      this.type = e.name;
      this.stack = [];
      this.remote = !!remote;
      this.id = crypto.randomBytes(8).toString("hex");
      if (e.stack) {
        var stack = e.stack.split("\n");
        stack.shift();
        stack.forEach((stackline) => {
          var line = stackline.trim().replace(/\(|\)/g, "");
          line = line.substring(line.indexOf(" ") + 1);
          var label = line.lastIndexOf(" ") >= 0 ? line.slice(0, line.lastIndexOf(" ")) : null;
          var path = Array.isArray(label) && !label.length ? line : line.slice(line.lastIndexOf(" ") + 1);
          path = path.split(":");
          var entry = {
            path: path[0],
            line: parseInt(path[1]),
            label: label || "anonymous"
          };
          this.stack.push(entry);
        }, this);
      }
    };
    module2.exports = CapturedException;
  }
});

// ../node_modules/.pnpm/atomic-batcher@1.0.2/node_modules/atomic-batcher/index.js
var require_atomic_batcher = __commonJS({
  "../node_modules/.pnpm/atomic-batcher@1.0.2/node_modules/atomic-batcher/index.js"(exports, module2) {
    module2.exports = batcher;
    function batcher(run) {
      var running = false;
      var pendingBatch = null;
      var pendingCallbacks = null;
      var callbacks = null;
      return append;
      function done(err) {
        if (callbacks)
          callAll(callbacks, err);
        running = false;
        callbacks = pendingCallbacks;
        var nextBatch = pendingBatch;
        pendingBatch = null;
        pendingCallbacks = null;
        if (!nextBatch || !nextBatch.length) {
          if (!callbacks || !callbacks.length) {
            callbacks = null;
            return;
          }
          if (!nextBatch)
            nextBatch = [];
        }
        running = true;
        run(nextBatch, done);
      }
      function append(val, cb) {
        if (running) {
          if (!pendingBatch) {
            pendingBatch = [];
            pendingCallbacks = [];
          }
          pushAll(pendingBatch, val);
          if (cb)
            pendingCallbacks.push(cb);
        } else {
          if (cb)
            callbacks = [cb];
          running = true;
          run(Array.isArray(val) ? val : [val], done);
        }
      }
    }
    function pushAll(list, val) {
      if (Array.isArray(val))
        pushArray(list, val);
      else
        list.push(val);
    }
    function pushArray(list, val) {
      for (var i = 0; i < val.length; i++)
        list.push(val[i]);
    }
    function callAll(list, err) {
      for (var i = 0; i < list.length; i++)
        list[i](err);
    }
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/daemon_config.js
var require_daemon_config = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/daemon_config.js"(exports, module2) {
    "use strict";
    var logger2 = require_logger();
    var DaemonConfig = {
      udp_ip: "127.0.0.1",
      udp_port: 2e3,
      tcp_ip: "127.0.0.1",
      tcp_port: 2e3,
      setDaemonAddress: function setDaemonAddress(address) {
        if (!process.env.AWS_XRAY_DAEMON_ADDRESS) {
          processAddress(address);
          logger2.getLogger().info("Configured daemon address to " + address + ".");
        } else {
          logger2.getLogger().warn("Ignoring call to setDaemonAddress as AWS_XRAY_DAEMON_ADDRESS is set. The current daemon address will not be changed.");
        }
      }
    };
    var processAddress = function processAddress2(address) {
      if (address.indexOf(":") === -1) {
        throw new Error("Invalid Daemon Address. You must specify an ip and port.");
      } else {
        var splitAddress = address.split(" ");
        if (splitAddress.length === 1) {
          if (address.indexOf("udp") > -1 || address.indexOf("tcp") > -1) {
            throw new Error("Invalid Daemon Address. You must specify both tcp and udp addresses.");
          }
          var addr = address.split(":");
          if (!addr[0]) {
            throw new Error("Invalid Daemon Address. You must specify an ip.");
          }
          DaemonConfig.udp_ip = addr[0];
          DaemonConfig.tcp_ip = addr[0];
          DaemonConfig.udp_port = addr[1];
          DaemonConfig.tcp_port = addr[1];
        } else if (splitAddress.length === 2) {
          var part_1 = splitAddress[0].split(":");
          var part_2 = splitAddress[1].split(":");
          var addr_map = {};
          addr_map[part_1[0]] = part_1;
          addr_map[part_2[0]] = part_2;
          DaemonConfig.udp_ip = addr_map["udp"][1];
          DaemonConfig.udp_port = parseInt(addr_map["udp"][2]);
          DaemonConfig.tcp_ip = addr_map["tcp"][1];
          DaemonConfig.tcp_port = parseInt(addr_map["tcp"][2]);
          if (!DaemonConfig.udp_port || !DaemonConfig.tcp_port) {
            throw new Error("Invalid Daemon Address. You must specify port number.");
          }
        }
      }
    };
    if (process.env.AWS_XRAY_DAEMON_ADDRESS) {
      processAddress(process.env.AWS_XRAY_DAEMON_ADDRESS);
    }
    module2.exports = DaemonConfig;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segment_emitter.js
var require_segment_emitter = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segment_emitter.js"(exports, module2) {
    "use strict";
    var dgram = require("dgram");
    var batcher = require_atomic_batcher();
    var logger2 = require_logger();
    var PROTOCOL_HEADER = '{"format":"json","version":1}';
    var PROTOCOL_DELIMITER = "\n";
    function batchSendData(ops, callback) {
      var client = dgram.createSocket("udp4");
      executeSendData(client, ops, 0, function() {
        try {
          client.close();
        } finally {
          callback();
        }
      });
    }
    function executeSendData(client, ops, index, callback) {
      if (index >= ops.length) {
        callback();
        return;
      }
      sendMessage(client, ops[index], function() {
        executeSendData(client, ops, index + 1, callback);
      });
    }
    function sendMessage(client, data, batchCallback) {
      var msg = data.msg;
      var offset = data.offset;
      var length = data.length;
      var port = data.port;
      var address = data.address;
      var callback = data.callback;
      client.send(msg, offset, length, port, address, function(err) {
        try {
          callback(err);
        } finally {
          batchCallback();
        }
      });
    }
    function BatchingTemporarySocket() {
      this.batchSend = batcher(batchSendData);
    }
    BatchingTemporarySocket.prototype.send = function(msg, offset, length, port, address, callback) {
      var work = {
        msg,
        offset,
        length,
        port,
        address,
        callback
      };
      this.batchSend(work);
    };
    var SegmentEmitter = {
      daemonConfig: require_daemon_config(),
      /**
       * Returns the formatted segment JSON string.
       * @param {Segment} segment - The segment to format.
       */
      format: function format(segment) {
        return PROTOCOL_HEADER + PROTOCOL_DELIMITER + segment.toString();
      },
      /**
       * Creates a UDP socket connection and send the formatted segment.
       * @param {Segment} segment - The segment to send to the daemon.
       */
      send: function send(segment) {
        if (!this.socket) {
          if (this.useBatchingTemporarySocket) {
            this.socket = new BatchingTemporarySocket();
          } else {
            this.socket = dgram.createSocket("udp4").unref();
          }
        }
        var client = this.socket;
        var formatted = segment.format();
        var data = PROTOCOL_HEADER + PROTOCOL_DELIMITER + formatted;
        var message = Buffer.from(data);
        var short = '{"trace_id:"' + segment.trace_id + '","id":"' + segment.id + '"}';
        var type = segment.type === "subsegment" ? "Subsegment" : "Segment";
        client.send(message, 0, message.length, this.daemonConfig.udp_port, this.daemonConfig.udp_ip, function(err) {
          if (err) {
            if (err.code === "EMSGSIZE") {
              logger2.getLogger().error(type + " too large to send: " + short + " (" + message.length + " bytes).");
            } else {
              logger2.getLogger().error("Error occured sending segment: ", err);
            }
          } else {
            logger2.getLogger().debug(type + ' sent: {"trace_id:"' + segment.trace_id + '","id":"' + segment.id + '"}');
            logger2.getLogger().debug("UDP message sent: " + segment);
          }
        });
      },
      /**
       * Configures the address and/or port the daemon is expected to be on.
       * @param {string} address - Address of the daemon the segments should be sent to. Should be formatted as an IPv4 address.
       * @module SegmentEmitter
       * @function setDaemonAddress
       */
      setDaemonAddress: function setDaemonAddress(address) {
        this.daemonConfig.setDaemonAddress(address);
      },
      /**
       * Get the UDP IP the emitter is configured to.
       * @module SegmentEmitter
       * @function getIp
       */
      getIp: function getIp() {
        return this.daemonConfig.udp_ip;
      },
      /**
       * Get the UDP port the emitter is configured to.
       * @module SegmentEmitter
       * @function getPort
       */
      getPort: function getPort() {
        return this.daemonConfig.udp_port;
      },
      /**
       * Forces the segment emitter to create a new socket on send, and close it on complete.
       * @module SegmentEmitter
       * @function disableReusableSocket
       */
      disableReusableSocket: function() {
        this.useBatchingTemporarySocket = true;
      }
    };
    module2.exports = SegmentEmitter;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/trace_id.js
var require_trace_id = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/trace_id.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    var logger2 = require_logger();
    var TraceID = class {
      /**
       * Constructs a new trace ID using the current time.
       * @param {string} [tsHex] - time stamp to use for trace ID in hexadecimal format
       * @param {string} [numberhex] - string of hexadecimal characters for random portion of Trace ID
       * @constructor
       */
      constructor(tsHex, numberhex) {
        this.version = 1;
        this.timestamp = tsHex || Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3).toString(16);
        this.id = numberhex || crypto.randomBytes(12).toString("hex");
      }
      /**
       * @returns {TraceID} - a hardcoded trace ID using zeroed timestamp and random ID
       */
      static Invalid() {
        return new TraceID("00000000", "000000000000000000000000");
      }
      /**
       * Constructs a new trace ID from provided string. If no string is provided or the provided string is invalid,
       * log an error but a new trace ID still returned. This can be used as a trace ID string validator.
       * @param {string} [rawID] - string to create a Trace ID object from.
       */
      static FromString(rawID) {
        const DELIMITER = "-";
        var traceID = new TraceID();
        var version, timestamp;
        if (!rawID || typeof rawID !== "string") {
          logger2.getLogger().error("Empty or non-string trace ID provided");
          return traceID;
        }
        const parts = rawID.trim().split(DELIMITER);
        if (parts.length !== 3) {
          logger2.getLogger().error("Unrecognized trace ID format");
          return traceID;
        }
        version = parseInt(parts[0]);
        if (isNaN(version) || version < 1) {
          logger2.getLogger().error("Trace ID version must be positive integer");
          return traceID;
        }
        timestamp = parseInt(parts[1], 16).toString(16);
        if (timestamp === "NaN") {
          logger2.getLogger().error("Trace ID timestamp must be a hex-encoded value");
          return traceID;
        }
        traceID.version = version;
        traceID.timestamp = timestamp;
        traceID.id = parts[2];
        return traceID;
      }
      /**
       * Returns a string representation of the trace ID.
       * @returns {string} - stringified trace ID, e.g. 1-57fbe041-2c7ad569f5d6ff149137be86
       */
      toString() {
        return `${this.version.toString()}-${this.timestamp}-${this.id}`;
      }
    };
    module2.exports = TraceID;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/utils.js
var require_utils3 = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/utils.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    var logger2 = require_logger();
    var TraceID = require_trace_id();
    var utils = {
      /**
       * Checks a HTTP response code, where 4xx are 'error' and 5xx are 'fault'.
       * @param {string} status - the HTTP response status code.
       * @returns [string] - 'error', 'fault' or nothing on no match
       * @alias module:utils.getCauseTypeFromHttpStatus
       */
      getCauseTypeFromHttpStatus: function getCauseTypeFromHttpStatus(status) {
        var stat = status.toString();
        if (stat.match(/^[4][0-9]{2}$/) !== null) {
          return "error";
        } else if (stat.match(/^[5][0-9]{2}$/) !== null) {
          return "fault";
        }
      },
      /**
       * Removes the query string parameters from a given http request path
       * as it may contain sensitive information
       *
       * Related issue: https://github.com/aws/aws-xray-sdk-node/issues/246
       *
       * Node documentation: https://nodejs.org/api/http.html#http_http_request_url_options_callback
       *
       * @param {string} path - options.path in a http.request callback
       * @returns [string] - removes query string element from path
       * @alias module:utils.stripQueryStringFromPath
       */
      stripQueryStringFromPath: function stripQueryStringFromPath(path) {
        return path ? path.split("?")[0] : "";
      },
      /**
       * Performs a case-insensitive wildcard match against two strings. This method works with pseduo-regex chars; specifically ? and * are supported.
       *   An asterisk (*) represents any combination of characters
       *   A question mark (?) represents any single character
       *
       * @param {string} pattern - the regex-like pattern to be compared against.
       * @param {string} text - the string to compare against the pattern.
       * @returns boolean
       * @alias module:utils.wildcardMatch
       */
      wildcardMatch: function wildcardMatch(pattern, text) {
        if (pattern === void 0 || text === void 0) {
          return false;
        }
        if (pattern.length === 1 && pattern.charAt(0) === "*") {
          return true;
        }
        var patternLength = pattern.length;
        var textLength = text.length;
        var indexOfGlob = pattern.indexOf("*");
        pattern = pattern.toLowerCase();
        text = text.toLowerCase();
        if (indexOfGlob === -1 || indexOfGlob === patternLength - 1) {
          var match = function simpleWildcardMatch() {
            var j2 = 0;
            for (var i2 = 0; i2 < patternLength; i2++) {
              var patternChar2 = pattern.charAt(i2);
              if (patternChar2 === "*") {
                return true;
              } else if (patternChar2 === "?") {
                if (j2 === textLength) {
                  return false;
                }
                j2++;
              } else {
                if (j2 >= textLength || patternChar2 != text.charAt(j2)) {
                  return false;
                }
                j2++;
              }
            }
            return j2 === textLength;
          };
          return match();
        }
        var matchArray = [];
        matchArray[0] = true;
        for (var j = 0; j < patternLength; j++) {
          var i;
          var patternChar = pattern.charAt(j);
          if (patternChar != "*") {
            for (i = textLength - 1; i >= 0; i--) {
              matchArray[i + 1] = !!matchArray[i] && (patternChar === "?" || patternChar === text.charAt(i));
            }
          } else {
            i = 0;
            while (i <= textLength && !matchArray[i]) {
              i++;
            }
            for (i; i <= textLength; i++) {
              matchArray[i] = true;
            }
          }
          matchArray[0] = matchArray[0] && patternChar === "*";
        }
        return matchArray[textLength];
      },
      LambdaUtils: {
        validTraceData: function(xAmznTraceId) {
          var valid = false;
          if (xAmznTraceId) {
            var data = utils.processTraceData(xAmznTraceId);
            valid = !!(data && data.root && data.parent && data.sampled);
          }
          return valid;
        },
        /**
         * Populates trace ID, parent ID, and sampled decision of given segment. Will always populate valid values,
         * even if xAmznTraceId contains missing or invalid values. This ensures downstream services receive valid
         * headers.
         * @param {Segment} segment - Facade segment to be populated
         * @param {String} xAmznTraceId - Raw Trace Header to supply trace data
         * @returns {Boolean} - true if required fields are present and Trace ID is valid, false otherwise
         */
        populateTraceData: function(segment, xAmznTraceId) {
          logger2.getLogger().debug("Lambda trace data found: " + xAmznTraceId);
          let traceData = utils.processTraceData(xAmznTraceId);
          var valid = false;
          if (!traceData) {
            traceData = {};
            logger2.getLogger().error("_X_AMZN_TRACE_ID is empty or has an invalid format");
          } else if (!traceData.root || !traceData.parent || !traceData.sampled) {
            logger2.getLogger().error("_X_AMZN_TRACE_ID is missing required information");
          } else {
            valid = true;
          }
          segment.trace_id = TraceID.FromString(traceData.root).toString();
          segment.id = traceData.parent || crypto.randomBytes(8).toString("hex");
          if (traceData.root && segment.trace_id !== traceData.root) {
            logger2.getLogger().error("_X_AMZN_TRACE_ID contains invalid trace ID");
            valid = false;
          }
          if (!parseInt(traceData.sampled)) {
            segment.notTraced = true;
          } else {
            delete segment.notTraced;
          }
          if (traceData.data) {
            segment.additionalTraceData = traceData.data;
          }
          logger2.getLogger().debug("Segment started: " + JSON.stringify(traceData));
          return valid;
        }
      },
      /**
       * Splits out the data from the trace id format.  Used by the middleware.
       * @param {String} traceData - The additional trace data (typically in req.headers.x-amzn-trace-id).
       * @returns {object}
       * @alias module:mw_utils.processTraceData
       */
      processTraceData: function processTraceData(traceData) {
        var amznTraceData = {};
        var data = {};
        var reservedKeywords = ["root", "parent", "sampled", "self"];
        var remainingBytes = 256;
        if (!(typeof traceData === "string" && traceData)) {
          return amznTraceData;
        }
        traceData.split(";").forEach(function(header) {
          if (!header) {
            return;
          }
          var pair = header.split("=");
          if (pair[0] && pair[1]) {
            let key = pair[0].trim();
            let value = pair[1].trim();
            let lowerCaseKey = key.toLowerCase();
            let reserved = reservedKeywords.indexOf(lowerCaseKey) !== -1;
            if (reserved) {
              amznTraceData[lowerCaseKey] = value;
            } else if (!reserved && remainingBytes - (lowerCaseKey.length + value.length) >= 0) {
              data[key] = value;
              remainingBytes -= key.length + value.length;
            }
          }
        });
        amznTraceData["data"] = data;
        return amznTraceData;
      },
      /**
       * Makes a shallow copy of an object without given keys - keeps prototype
       * @param {Object} obj - The object to copy
       * @param {string[]} [keys=[]] - The keys that won't be copied
       * @param {boolean} [preservePrototype=false] - If true also copy prototype properties
       * @returns {}
       */
      objectWithoutProperties: function objectWithoutProperties(obj, keys, preservePrototype) {
        keys = Array.isArray(keys) ? keys : [];
        preservePrototype = typeof preservePrototype === "boolean" ? preservePrototype : false;
        var target = preservePrototype ? Object.create(Object.getPrototypeOf(obj)) : {};
        for (var property in obj) {
          if (keys.indexOf(property) >= 0) {
            continue;
          }
          if (!Object.prototype.hasOwnProperty.call(obj, property)) {
            continue;
          }
          target[property] = obj[property];
        }
        return target;
      },
      /**
       * Safely gets an integer from a string or number
       * @param {String | Number} - input to cast to integer
       * @returns {Number} - Integer representation of input, or 0 if input is not castable to int
       */
      safeParseInt: (val) => {
        if (!val || isNaN(val)) {
          return 0;
        }
        return parseInt(val);
      }
    };
    module2.exports = utils;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/segment_utils.js
var require_segment_utils = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/segment_utils.js"(exports, module2) {
    "use strict";
    var { safeParseInt } = require_utils3();
    var logger2 = require_logger();
    var DEFAULT_STREAMING_THRESHOLD = 100;
    var utils = {
      streamingThreshold: DEFAULT_STREAMING_THRESHOLD,
      getCurrentTime: function getCurrentTime() {
        return Date.now() / 1e3;
      },
      setOrigin: function setOrigin(origin) {
        this.origin = origin;
      },
      setPluginData: function setPluginData(pluginData) {
        this.pluginData = pluginData;
      },
      setSDKData: function setSDKData(sdkData) {
        this.sdkData = sdkData;
      },
      setServiceData: function setServiceData(serviceData) {
        this.serviceData = serviceData;
      },
      /**
       * Overrides the default streaming threshold (100).
       * The threshold represents the maximum number of subsegments on a single segment before
       * the SDK beings to send the completed subsegments out of band of the main segment.
       * Reduce this threshold if you see the 'Segment too large to send' error.
       * @param {number} threshold - The new threshold to use.
       * @memberof AWSXRay
       */
      setStreamingThreshold: function setStreamingThreshold(threshold) {
        if (isFinite(threshold) && threshold >= 0) {
          utils.streamingThreshold = threshold;
          logger2.getLogger().debug("Subsegment streaming threshold set to: " + threshold);
        } else {
          logger2.getLogger().error("Invalid threshold: " + threshold + ". Must be a whole number >= 0.");
        }
      },
      getStreamingThreshold: function getStreamingThreshold() {
        return utils.streamingThreshold;
      },
      /**
       * Parses an HTTP response object to return an X-Ray compliant HTTP response object.
       * @param {http.ServerResponse} res
       * @returns {Object} - X-Ray response object to be added to (sub)segment
       */
      getHttpResponseData: (res) => {
        const ret = {};
        if (!res) {
          return ret;
        }
        const status = safeParseInt(res.statusCode);
        if (status !== 0) {
          ret.status = status;
        }
        if (res.headers && res.headers["content-length"]) {
          ret.content_length = safeParseInt(res.headers["content-length"]);
        }
        return ret;
      },
      getJsonStringifyReplacer: () => (_, value) => {
        if (typeof value === "bigint") {
          return value.toString();
        }
        return value;
      }
    };
    module2.exports = utils;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/remote_request_data.js
var require_remote_request_data = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/remote_request_data.js"(exports, module2) {
    "use strict";
    var { getHttpResponseData } = require_segment_utils();
    var { stripQueryStringFromPath } = require_utils3();
    function RemoteRequestData(req, res, downstreamXRayEnabled) {
      this.init(req, res, downstreamXRayEnabled);
    }
    RemoteRequestData.prototype.init = function init(req, res, downstreamXRayEnabled) {
      this.request = {
        url: req.agent && req.agent.protocol ? req.agent.protocol + "//" + (req.host || req.getHeader("host")) + stripQueryStringFromPath(req.path) : "",
        method: req.method || ""
      };
      if (downstreamXRayEnabled) {
        this.request.traced = true;
      }
      if (res) {
        this.response = getHttpResponseData(res);
      }
    };
    module2.exports = RemoteRequestData;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/subsegment.js
var require_subsegment = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/subsegment.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    var CapturedException = require_captured_exception();
    var RemoteRequestData = require_remote_request_data();
    var SegmentEmitter = require_segment_emitter();
    var SegmentUtils = require_segment_utils();
    var Utils = require_utils3();
    var logger2 = require_logger();
    function Subsegment(name) {
      this.init(name);
    }
    Subsegment.prototype.init = function init(name) {
      if (typeof name != "string") {
        throw new Error("Subsegment name must be of type string.");
      }
      this.id = crypto.randomBytes(8).toString("hex");
      this.name = name;
      this.start_time = SegmentUtils.getCurrentTime();
      this.in_progress = true;
      this.counter = 0;
      this.notTraced = false;
    };
    Subsegment.prototype.addNewSubsegment = function addNewSubsegment(name) {
      const subsegment = new Subsegment(name);
      this.addSubsegment(subsegment);
      return subsegment;
    };
    Subsegment.prototype.addSubsegmentWithoutSampling = function addSubsegmentWithoutSampling(subsegment) {
      this.addSubsegment(subsegment);
      subsegment.notTraced = true;
    };
    Subsegment.prototype.addNewSubsegmentWithoutSampling = function addNewSubsegmentWithoutSampling(name) {
      const subsegment = new Subsegment(name);
      this.addSubsegment(subsegment);
      subsegment.notTraced = true;
      return subsegment;
    };
    Subsegment.prototype.addSubsegment = function(subsegment) {
      if (!(subsegment instanceof Subsegment)) {
        throw new Error("Failed to add subsegment:" + subsegment + ' to subsegment "' + this.name + '".  Not a subsegment.');
      }
      if (this.subsegments === void 0) {
        this.subsegments = [];
      }
      subsegment.segment = this.segment;
      subsegment.parent = this;
      subsegment.notTraced = subsegment.parent.notTraced;
      if (subsegment.end_time === void 0) {
        this.incrementCounter(subsegment.counter);
      }
      this.subsegments.push(subsegment);
    };
    Subsegment.prototype.removeSubsegment = function removeSubsegment(subsegment) {
      if (!(subsegment instanceof Subsegment)) {
        throw new Error("Failed to remove subsegment:" + subsegment + ' from subsegment "' + this.name + '".  Not a subsegment.');
      }
      if (this.subsegments !== void 0) {
        var index = this.subsegments.indexOf(subsegment);
        if (index >= 0) {
          this.subsegments.splice(index, 1);
        }
      }
    };
    Subsegment.prototype.addAttribute = function addAttribute(name, data) {
      this[name] = data;
    };
    Subsegment.prototype.addPrecursorId = function(id) {
      if (typeof id !== "string") {
        logger2.getLogger().error("Failed to add id:" + id + " to subsegment " + this.name + ".  Precursor Ids must be of type string.");
      }
      if (this.precursor_ids === void 0) {
        this.precursor_ids = [];
      }
      this.precursor_ids.push(id);
    };
    Subsegment.prototype.addAnnotation = function(key, value) {
      if (typeof value !== "boolean" && typeof value !== "string" && !isFinite(value)) {
        logger2.getLogger().error("Failed to add annotation key: " + key + " value: " + value + " to subsegment " + this.name + ". Value must be of type string, number or boolean.");
        return;
      }
      if (typeof key !== "string") {
        logger2.getLogger().error("Failed to add annotation key: " + key + " value: " + value + " to subsegment " + this.name + ". Key must be of type string.");
        return;
      }
      if (this.annotations === void 0) {
        this.annotations = {};
      }
      this.annotations[key] = value;
    };
    Subsegment.prototype.addMetadata = function(key, value, namespace) {
      if (typeof key !== "string") {
        logger2.getLogger().error("Failed to add metadata key: " + key + " value: " + value + " to subsegment " + this.name + ". Key must be of type string.");
        return;
      }
      if (namespace && typeof namespace !== "string") {
        logger2.getLogger().error("Failed to add metadata key: " + key + " value: " + value + " to subsegment " + this.name + ". Namespace must be of type string.");
        return;
      }
      var ns = namespace || "default";
      if (!this.metadata) {
        this.metadata = {};
      }
      if (!this.metadata[ns]) {
        this.metadata[ns] = {};
      }
      if (ns !== "__proto__") {
        this.metadata[ns][key] = value !== null && value !== void 0 ? value : "";
      }
    };
    Subsegment.prototype.addSqlData = function addSqlData(sqlData) {
      this.sql = sqlData;
    };
    Subsegment.prototype.addError = function addError(err, remote) {
      if (err == null || typeof err !== "object" && typeof err !== "string") {
        logger2.getLogger().error("Failed to add error:" + err + ' to subsegment "' + this.name + '".  Not an object or string literal.');
        return;
      }
      this.addFaultFlag();
      if (this.segment && this.segment.exception) {
        if (err === this.segment.exception.ex) {
          this.fault = true;
          this.cause = { id: this.segment.exception.cause, exceptions: [] };
          return;
        }
        delete this.segment.exception;
      }
      if (this.segment) {
        this.segment.exception = {
          ex: err,
          cause: this.id
        };
      } else {
      }
      if (this.cause === void 0) {
        this.cause = {
          working_directory: process.cwd(),
          exceptions: []
        };
      }
      this.cause.exceptions.unshift(new CapturedException(err, remote));
    };
    Subsegment.prototype.addRemoteRequestData = function addRemoteRequestData(req, res, downstreamXRayEnabled) {
      this.http = new RemoteRequestData(req, res, downstreamXRayEnabled);
      if ("traced" in this.http.request) {
        this.traced = this.http.request.traced;
        delete this.http.request.traced;
      }
    };
    Subsegment.prototype.addFaultFlag = function addFaultFlag() {
      this.fault = true;
    };
    Subsegment.prototype.addErrorFlag = function addErrorFlag() {
      this.error = true;
    };
    Subsegment.prototype.addThrottleFlag = function addThrottleFlag() {
      this.throttle = true;
    };
    Subsegment.prototype.close = function close(err, remote) {
      var root = this.segment;
      this.end_time = SegmentUtils.getCurrentTime();
      delete this.in_progress;
      if (err) {
        this.addError(err, remote);
      }
      if (this.parent) {
        this.parent.decrementCounter();
      }
      if (root && root.counter > SegmentUtils.getStreamingThreshold()) {
        if (this.streamSubsegments() && this.parent) {
          this.parent.removeSubsegment(this);
        }
      }
    };
    Subsegment.prototype.incrementCounter = function incrementCounter(additional) {
      this.counter = additional ? this.counter + additional + 1 : this.counter + 1;
      if (this.parent) {
        this.parent.incrementCounter(additional);
      }
    };
    Subsegment.prototype.decrementCounter = function decrementCounter() {
      this.counter--;
      if (this.parent) {
        this.parent.decrementCounter();
      }
    };
    Subsegment.prototype.isClosed = function isClosed() {
      return !this.in_progress;
    };
    Subsegment.prototype.flush = function flush() {
      if (!this.parent || !this.segment) {
        logger2.getLogger().error("Failed to flush subsegment: " + this.name + ". Subsegment must be added to a segment chain to flush.");
        return;
      }
      if (this.segment.trace_id) {
        if (this.segment.notTraced !== true && !this.notTraced) {
          SegmentEmitter.send(this);
        } else {
          logger2.getLogger().debug("Ignoring flush on subsegment " + this.id + ". Associated segment is marked as not sampled.");
        }
      } else {
        logger2.getLogger().debug("Ignoring flush on subsegment " + this.id + ". Associated segment is missing a trace ID.");
      }
    };
    Subsegment.prototype.streamSubsegments = function streamSubsegments() {
      if (this.isClosed() && this.counter <= 0) {
        this.flush();
        return true;
      } else if (this.subsegments && this.subsegments.length > 0) {
        var open = [];
        this.subsegments.forEach(function(child) {
          if (!child.streamSubsegments()) {
            open.push(child);
          }
        });
        this.subsegments = open;
      }
    };
    Subsegment.prototype.format = function format() {
      this.type = "subsegment";
      if (this.parent) {
        this.parent_id = this.parent.id;
      }
      if (this.segment) {
        this.trace_id = this.segment.trace_id;
      }
      return this.serialize();
    };
    Subsegment.prototype.toString = function toString() {
      return this.serialize();
    };
    Subsegment.prototype.toJSON = function toJSON() {
      var ignore = ["segment", "parent", "counter"];
      if (this.subsegments == null || this.subsegments.length === 0) {
        ignore.push("subsegments");
      }
      var thisCopy = Utils.objectWithoutProperties(this, ignore, false);
      return thisCopy;
    };
    Subsegment.prototype.serialize = function serialize(object) {
      return JSON.stringify(object !== null && object !== void 0 ? object : this, SegmentUtils.getJsonStringifyReplacer());
    };
    module2.exports = Subsegment;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/segment.js
var require_segment = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/segment.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    var CapturedException = require_captured_exception();
    var SegmentEmitter = require_segment_emitter();
    var SegmentUtils = require_segment_utils();
    var Subsegment = require_subsegment();
    var TraceID = require_trace_id();
    var Utils = require_utils3();
    var logger2 = require_logger();
    function Segment(name, rootId, parentId) {
      this.init(name, rootId, parentId);
    }
    Segment.prototype.init = function init(name, rootId, parentId) {
      if (typeof name != "string") {
        throw new Error("Segment name must be of type string.");
      }
      var traceId;
      if (rootId && typeof rootId == "string") {
        traceId = TraceID.FromString(rootId);
      } else {
        traceId = new TraceID();
      }
      var id = crypto.randomBytes(8).toString("hex");
      var startTime = SegmentUtils.getCurrentTime();
      this.trace_id = traceId.toString();
      this.id = id;
      this.start_time = startTime;
      this.name = name || "";
      this.in_progress = true;
      this.counter = 0;
      if (parentId) {
        this.parent_id = parentId;
      }
      if (SegmentUtils.serviceData) {
        this.setServiceData(SegmentUtils.serviceData);
      }
      if (SegmentUtils.pluginData) {
        this.addPluginData(SegmentUtils.pluginData);
      }
      if (SegmentUtils.origin) {
        this.origin = SegmentUtils.origin;
      }
      if (SegmentUtils.sdkData) {
        this.setSDKData(SegmentUtils.sdkData);
      }
    };
    Segment.prototype.addIncomingRequestData = function addIncomingRequestData(data) {
      this.http = data;
    };
    Segment.prototype.addAnnotation = function addAnnotation(key, value) {
      if (typeof value !== "boolean" && typeof value !== "string" && !isFinite(value)) {
        logger2.getLogger().error("Failed to add annotation key: " + key + " value: " + value + " to subsegment " + this.name + ". Value must be of type string, number or boolean.");
        return;
      }
      if (typeof key !== "string") {
        logger2.getLogger().error("Failed to add annotation key: " + key + " value: " + value + " to subsegment " + this.name + ". Key must be of type string.");
        return;
      }
      if (this.annotations === void 0) {
        this.annotations = {};
      }
      this.annotations[key] = value;
    };
    Segment.prototype.setUser = function(user) {
      if (typeof user !== "string") {
        logger2.getLogger().error("Set user: " + user + " failed. User IDs must be of type string.");
      }
      this.user = user;
    };
    Segment.prototype.addMetadata = function(key, value, namespace) {
      if (typeof key !== "string") {
        logger2.getLogger().error("Failed to add metadata key: " + key + " value: " + value + " to segment " + this.name + ". Key must be of type string.");
        return;
      }
      if (namespace && typeof namespace !== "string") {
        logger2.getLogger().error("Failed to add metadata key: " + key + " value: " + value + " to segment " + this.name + ". Namespace must be of type string.");
        return;
      }
      var ns = namespace || "default";
      if (!this.metadata) {
        this.metadata = {};
      }
      if (!this.metadata[ns]) {
        this.metadata[ns] = {};
      }
      if (ns !== "__proto__") {
        this.metadata[ns][key] = value !== null && value !== void 0 ? value : "";
      }
    };
    Segment.prototype.setSDKData = function setSDKData(data) {
      if (!data) {
        logger2.getLogger().error("Add SDK data: " + data + " failed.Must not be empty.");
        return;
      }
      if (!this.aws) {
        this.aws = {};
      }
      this.aws.xray = data;
    };
    Segment.prototype.setMatchedSamplingRule = function setMatchedSamplingRule(ruleName) {
      if (this.aws) {
        this.aws = JSON.parse(JSON.stringify(this.aws));
      }
      if (this.aws && this.aws["xray"]) {
        this.aws.xray["rule_name"] = ruleName;
      } else {
        this.aws = { xray: { "rule_name": ruleName } };
      }
    };
    Segment.prototype.setServiceData = function setServiceData(data) {
      if (!data) {
        logger2.getLogger().error("Add service data: " + data + " failed.Must not be empty.");
        return;
      }
      this.service = data;
    };
    Segment.prototype.addPluginData = function addPluginData(data) {
      if (this.aws === void 0) {
        this.aws = {};
      }
      Object.assign(this.aws, data);
    };
    Segment.prototype.addNewSubsegment = function addNewSubsegment(name) {
      var subsegment = new Subsegment(name);
      this.addSubsegment(subsegment);
      return subsegment;
    };
    Segment.prototype.addSubsegmentWithoutSampling = function addSubsegmentWithoutSampling(subsegment) {
      this.addSubsegment(subsegment);
      subsegment.notTraced = true;
    };
    Segment.prototype.addNewSubsegmentWithoutSampling = function addNewSubsegmentWithoutSampling(name) {
      const subsegment = new Subsegment(name);
      this.addSubsegment(subsegment);
      subsegment.notTraced = true;
      return subsegment;
    };
    Segment.prototype.addSubsegment = function addSubsegment(subsegment) {
      if (!(subsegment instanceof Subsegment)) {
        throw new Error("Cannot add subsegment: " + subsegment + ". Not a subsegment.");
      }
      if (this.subsegments === void 0) {
        this.subsegments = [];
      }
      subsegment.segment = this;
      subsegment.parent = this;
      subsegment.notTraced = subsegment.parent.notTraced;
      this.subsegments.push(subsegment);
      if (!subsegment.end_time) {
        this.incrementCounter(subsegment.counter);
      }
    };
    Segment.prototype.removeSubsegment = function removeSubsegment(subsegment) {
      if (!(subsegment instanceof Subsegment)) {
        throw new Error("Failed to remove subsegment:" + subsegment + ' from subsegment "' + this.name + '".  Not a subsegment.');
      }
      if (this.subsegments !== void 0) {
        var index = this.subsegments.indexOf(subsegment);
        if (index >= 0) {
          this.subsegments.splice(index, 1);
        }
      }
    };
    Segment.prototype.addError = function addError(err, remote) {
      if (err == null || typeof err !== "object" && typeof err !== "string") {
        logger2.getLogger().error("Failed to add error:" + err + ' to subsegment "' + this.name + '".  Not an object or string literal.');
        return;
      }
      this.addFaultFlag();
      if (this.exception) {
        if (err === this.exception.ex) {
          this.cause = { id: this.exception.cause };
          delete this.exception;
          return;
        }
        delete this.exception;
      }
      if (this.cause === void 0) {
        this.cause = {
          working_directory: process.cwd(),
          exceptions: []
        };
      }
      this.cause.exceptions.push(new CapturedException(err, remote));
    };
    Segment.prototype.addFaultFlag = function addFaultFlag() {
      this.fault = true;
    };
    Segment.prototype.addErrorFlag = function addErrorFlag() {
      this.error = true;
    };
    Segment.prototype.addThrottleFlag = function addThrottleFlag() {
      this.throttle = true;
    };
    Segment.prototype.isClosed = function isClosed() {
      return !this.in_progress;
    };
    Segment.prototype.incrementCounter = function incrementCounter(additional) {
      this.counter = additional ? this.counter + additional + 1 : this.counter + 1;
      if (this.counter > SegmentUtils.streamingThreshold && this.subsegments && this.subsegments.length > 0) {
        var open = [];
        this.subsegments.forEach(function(child) {
          if (!child.streamSubsegments()) {
            open.push(child);
          }
        });
        this.subsegments = open;
      }
    };
    Segment.prototype.decrementCounter = function decrementCounter() {
      this.counter--;
      if (this.counter <= 0 && this.isClosed()) {
        this.flush();
      }
    };
    Segment.prototype.close = function(err, remote) {
      if (!this.end_time) {
        this.end_time = SegmentUtils.getCurrentTime();
      }
      if (err !== void 0) {
        this.addError(err, remote);
      }
      delete this.in_progress;
      delete this.exception;
      if (this.counter <= 0) {
        this.flush();
      }
    };
    Segment.prototype.flush = function flush() {
      if (this.notTraced !== true) {
        delete this.exception;
        var thisCopy = Utils.objectWithoutProperties(this, ["counter", "notTraced"], true);
        SegmentEmitter.send(thisCopy);
      }
    };
    Segment.prototype.format = function format() {
      var ignore = ["segment", "parent", "counter"];
      if (this.subsegments == null || this.subsegments.length === 0) {
        ignore.push("subsegments");
      }
      var thisCopy = Utils.objectWithoutProperties(this, ignore, false);
      return this.serialize(thisCopy);
    };
    Segment.prototype.toString = function toString() {
      return this.serialize();
    };
    Segment.prototype.serialize = function serialize(object) {
      return JSON.stringify(object !== null && object !== void 0 ? object : this, SegmentUtils.getJsonStringifyReplacer());
    };
    module2.exports = Segment;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/context_utils.js
var require_context_utils = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/context_utils.js"(exports, module2) {
    "use strict";
    var cls = require_context();
    var logger2 = require_logger();
    var Segment = require_segment();
    var Subsegment = require_subsegment();
    var cls_mode = true;
    var NAMESPACE = "AWSXRay";
    var SEGMENT = "segment";
    var contextOverride = false;
    var contextUtils = {
      CONTEXT_MISSING_STRATEGY: {
        RUNTIME_ERROR: {
          contextMissing: function contextMissingRuntimeError(message) {
            throw new Error(message);
          }
        },
        LOG_ERROR: {
          contextMissing: function contextMissingLogError(message) {
            var err = new Error(message);
            logger2.getLogger().error(err.stack);
          }
        },
        IGNORE_ERROR: {
          contextMissing: function contextMissingIgnoreError() {
          }
        }
      },
      contextMissingStrategy: {},
      /**
       * Resolves the segment or subsegment given manual mode and params on the call required.
       * @param [Segment|Subsegment] segment - The segment manually provided via params.XraySegment, if provided.
       * @returns {Segment|Subsegment}
       * @alias module:context_utils.resolveManualSegmentParams
       */
      resolveManualSegmentParams: function resolveManualSegmentParams(params) {
        if (params && !contextUtils.isAutomaticMode()) {
          var xraySegment = params.XRaySegment || params.XraySegment;
          var segment = params.Segment;
          var found = null;
          if (xraySegment && (xraySegment instanceof Segment || xraySegment instanceof Subsegment)) {
            found = xraySegment;
            delete params.XRaySegment;
            delete params.XraySegment;
          } else if (segment && (segment instanceof Segment || segment instanceof Subsegment)) {
            found = segment;
            delete params.Segment;
          }
          return found;
        }
      },
      /**
       * Gets current CLS namespace for X-Ray SDK or creates one if absent.
       * @returns {Namespace}
       * @alias module:context_utils.getNamespace
       */
      getNamespace: function getNamespace() {
        return cls.getNamespace(NAMESPACE) || cls.createNamespace(NAMESPACE);
      },
      /**
       * Resolves the segment or subsegment given manual or automatic mode.
       * @param [Segment|Subsegment] segment - The segment manually provided, if provided.
       * @returns {Segment|Subsegment}
       * @alias module:context_utils.resolveSegment
       */
      resolveSegment: function resolveSegment(segment) {
        if (cls_mode) {
          return this.getSegment();
        } else if (segment && !cls_mode) {
          return segment;
        } else if (!segment && !cls_mode) {
          contextUtils.contextMissingStrategy.contextMissing("No sub/segment specified. A sub/segment must be provided for manual mode.");
        }
      },
      /**
       * Returns the current segment or subsegment.  For use with in automatic mode only.
       * @returns {Segment|Subsegment}
       * @alias module:context_utils.getSegment
       */
      getSegment: function getSegment() {
        if (cls_mode) {
          var segment = contextUtils.getNamespace(NAMESPACE).get(SEGMENT);
          if (!segment) {
            contextUtils.contextMissingStrategy.contextMissing("Failed to get the current sub/segment from the context.");
          } else if (segment instanceof Segment && process.env.LAMBDA_TASK_ROOT && segment.facade == true) {
            segment.resolveLambdaTraceData();
          }
          return segment;
        } else {
          contextUtils.contextMissingStrategy.contextMissing("Cannot get sub/segment from context. Not supported in manual mode.");
        }
      },
      /**
       * Sets the current segment or subsegment.  For use with in automatic mode only.
       * @param [Segment|Subsegment] segment - The sub/segment to set.
       * @returns {Segment|Subsegment}
       * @alias module:context_utils.setSegment
       */
      setSegment: function setSegment(segment) {
        if (cls_mode) {
          if (!contextUtils.getNamespace(NAMESPACE).set(SEGMENT, segment)) {
            logger2.getLogger().warn("Failed to set the current sub/segment on the context.");
          }
        } else {
          contextUtils.contextMissingStrategy.contextMissing("Cannot set sub/segment on context. Not supported in manual mode.");
        }
      },
      /**
       * Returns true if in automatic mode, otherwise false.
       * @returns {Segment|Subsegment}
       * @alias module:context_utils.isAutomaticMode
       */
      isAutomaticMode: function isAutomaticMode() {
        return cls_mode;
      },
      /**
       * Enables automatic mode. Automatic mode uses 'cls-hooked'.
       * @see https://github.com/jeff-lewis/cls-hooked
       * @alias module:context_utils.enableAutomaticMode
       */
      enableAutomaticMode: function enableAutomaticMode() {
        cls_mode = true;
        contextUtils.getNamespace(NAMESPACE);
        logger2.getLogger().debug("Overriding AWS X-Ray SDK mode. Set to automatic mode.");
      },
      /**
       * Disables automatic mode. Current segment or subsegment then must be passed manually
       * via the parent optional on captureFunc, captureAsyncFunc etc.
       * @alias module:context_utils.enableManualMode
       */
      enableManualMode: function enableManualMode() {
        cls_mode = false;
        if (cls.getNamespace(NAMESPACE)) {
          cls.destroyNamespace(NAMESPACE);
        }
        logger2.getLogger().debug("Overriding AWS X-Ray SDK mode. Set to manual mode.");
      },
      /**
       * Sets the context missing strategy if no context missing strategy is set using the environment variable with
       * key AWS_XRAY_CONTEXT_MISSING. The context missing strategy's contextMissing function will be called whenever
       * trace context is not found.
       * @param {string|function} strategy - The strategy to set. Valid string values are 'LOG_ERROR' and 'RUNTIME_ERROR'.
       *                                     Alternatively, a custom function can be supplied, which takes a error message string.
       */
      setContextMissingStrategy: function setContextMissingStrategy(strategy) {
        if (!contextOverride) {
          if (typeof strategy === "string") {
            var lookupStrategy = contextUtils.CONTEXT_MISSING_STRATEGY[strategy.toUpperCase()];
            if (lookupStrategy) {
              contextUtils.contextMissingStrategy.contextMissing = lookupStrategy.contextMissing;
              if (process.env.AWS_XRAY_CONTEXT_MISSING) {
                logger2.getLogger().debug("AWS_XRAY_CONTEXT_MISSING is set. Configured context missing strategy to " + process.env.AWS_XRAY_CONTEXT_MISSING + ".");
              } else {
                logger2.getLogger().debug("Configured context missing strategy to: " + strategy);
              }
            } else {
              throw new Error("Invalid context missing strategy: " + strategy + ". Valid values are " + Object.keys(contextUtils.CONTEXT_MISSING_STRATEGY) + ".");
            }
          } else if (typeof strategy === "function") {
            contextUtils.contextMissingStrategy.contextMissing = strategy;
            logger2.getLogger().info("Configured custom context missing strategy to function: " + strategy.name);
          } else {
            throw new Error("Context missing strategy must be either a string or a custom function.");
          }
        } else {
          logger2.getLogger().warn("Ignoring call to setContextMissingStrategy as AWS_XRAY_CONTEXT_MISSING is set. The current context missing strategy will not be changed.");
        }
      }
    };
    if (process.env.AWS_XRAY_MANUAL_MODE) {
      cls_mode = false;
      logger2.getLogger().debug("Starting the AWS X-Ray SDK in manual mode.");
    } else {
      cls.createNamespace(NAMESPACE);
      logger2.getLogger().debug("Starting the AWS X-Ray SDK in automatic mode (default).");
    }
    if (process.env.AWS_XRAY_CONTEXT_MISSING) {
      contextUtils.setContextMissingStrategy(process.env.AWS_XRAY_CONTEXT_MISSING);
      contextOverride = true;
    } else {
      contextUtils.contextMissingStrategy.contextMissing = contextUtils.CONTEXT_MISSING_STRATEGY.LOG_ERROR.contextMissing;
      logger2.getLogger().debug("Using default context missing strategy: LOG_ERROR");
    }
    module2.exports = contextUtils;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/incoming_request_data.js
var require_incoming_request_data = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/incoming_request_data.js"(exports, module2) {
    "use strict";
    var { getHttpResponseData } = require_segment_utils();
    function IncomingRequestData(req) {
      this.init(req);
    }
    IncomingRequestData.prototype.init = function init(req) {
      var forwarded = !!req.headers["x-forwarded-for"];
      var url;
      if (req.connection) {
        url = (req.connection.secure || req.connection.encrypted ? "https://" : "http://") + ((req.headers["host"] || "") + (req.url || ""));
      }
      this.request = {
        method: req.method || "",
        user_agent: req.headers["user-agent"] || "",
        client_ip: getClientIp(req) || "",
        url: url || ""
      };
      if (forwarded) {
        this.request.x_forwarded_for = forwarded;
      }
    };
    var getClientIp = function getClientIp2(req) {
      var clientIp;
      if (req.headers["x-forwarded-for"]) {
        clientIp = (req.headers["x-forwarded-for"] || "").split(",")[0];
      } else if (req.connection && req.connection.remoteAddress) {
        clientIp = req.connection.remoteAddress;
      } else if (req.socket && req.socket.remoteAddress) {
        clientIp = req.socket.remoteAddress;
      } else if (req.connection && req.connection.socket && req.connection.socket.remoteAddress) {
        clientIp = req.connection.socket.remoteAddress;
      }
      return clientIp;
    };
    IncomingRequestData.prototype.close = function close(res) {
      this.response = getHttpResponseData(res);
    };
    module2.exports = IncomingRequestData;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/local_reservoir.js
var require_local_reservoir = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/local_reservoir.js"(exports, module2) {
    "use strict";
    function LocalReservoir(fixedTarget, fallbackRate) {
      this.init(fixedTarget, fallbackRate);
    }
    LocalReservoir.prototype.init = function init(fixedTarget, fallbackRate) {
      this.usedThisSecond = 0;
      if (typeof fixedTarget === "number" && fixedTarget % 1 === 0 && fixedTarget >= 0) {
        this.fixedTarget = fixedTarget;
      } else {
        throw new Error('Error in sampling file. Rule attribute "fixed_target" must be a non-negative integer.');
      }
      if (typeof fallbackRate === "number" && fallbackRate >= 0 && fallbackRate <= 1) {
        this.fallbackRate = fallbackRate;
      } else {
        throw new Error('Error in sampling file. Rule attribute "rate" must be a number between 0 and 1 inclusive.');
      }
    };
    LocalReservoir.prototype.isSampled = function isSampled() {
      var now = Math.round((/* @__PURE__ */ new Date()).getTime() / 1e3);
      if (now !== this.thisSecond) {
        this.usedThisSecond = 0;
        this.thisSecond = now;
      }
      if (this.usedThisSecond >= this.fixedTarget) {
        return Math.random() < this.fallbackRate;
      }
      this.usedThisSecond++;
      return true;
    };
    module2.exports = LocalReservoir;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/resources/default_sampling_rules.json
var require_default_sampling_rules = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/resources/default_sampling_rules.json"(exports, module2) {
    module2.exports = {
      default: {
        fixed_target: 1,
        rate: 0.05
      },
      version: 2
    };
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/local_sampler.js
var require_local_sampler = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/local_sampler.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var LocalReservoir = require_local_reservoir();
    var Utils = require_utils3();
    var defaultRules = require_default_sampling_rules();
    var logger2 = require_logger();
    var LocalSampler = {
      /**
       * Makes a sample decision based on the sample request.
       * @param {object} sampleRequest - Contains information for rules matching.
       * @module LocalSampler
       * @function shouldSample
       */
      shouldSample: function shouldSample(sampleRequest) {
        var host = sampleRequest.host;
        var httpMethod = sampleRequest.httpMethod;
        var urlPath = sampleRequest.urlPath;
        var formatted = "{ http_method: " + httpMethod + ", host: " + host + ", url_path: " + urlPath + " }";
        var matched;
        this.rules.some(function(rule) {
          if (rule.default || (host == null || Utils.wildcardMatch(rule.host, host) && (httpMethod == null || Utils.wildcardMatch(rule.http_method, httpMethod)) && (urlPath == null || Utils.wildcardMatch(rule.url_path, urlPath)))) {
            matched = rule.reservoir;
            logger2.getLogger().debug("Local sampling rule match found for " + formatted + ". Matched " + (rule.default ? "default" : "{ http_method: " + rule.http_method + ", host: " + rule.host + ", url_path: " + rule.url_path + " }") + ". Using fixed_target: " + matched.fixedTarget + " and rate: " + matched.fallbackRate + ".");
            return true;
          }
        });
        if (matched) {
          return matched.isSampled();
        } else {
          logger2.getLogger().debug("No sampling rule matched for " + formatted);
          return false;
        }
      },
      /**
       * Set local rules for making sampling decisions.
       * @module LocalSampler
       * @function setLocalRules
       */
      setLocalRules: function setLocalRules(source) {
        if (source) {
          if (typeof source === "string") {
            logger2.getLogger().info("Using custom sampling rules file: " + source);
            this.rules = loadRulesConfig(JSON.parse(fs.readFileSync(source, "utf8")));
          } else {
            logger2.getLogger().info("Using custom sampling rules source.");
            this.rules = loadRulesConfig(source);
          }
        } else {
          this.rules = parseRulesConfig(defaultRules);
        }
      }
    };
    var loadRulesConfig = function loadRulesConfig2(config) {
      if (!config.version) {
        throw new Error('Error in sampling file. Missing "version" attribute.');
      }
      if (config.version === 1 || config.version === 2) {
        return parseRulesConfig(config);
      } else {
        throw new Error('Error in sampling file. Unknown version "' + config.version + '".');
      }
    };
    var parseRulesConfig = function parseRulesConfig2(config) {
      var defaultRule;
      var rules = [];
      if (config.default) {
        var missing = [];
        for (var key in config.default) {
          if (key !== "fixed_target" && key !== "rate") {
            throw new Error("Error in sampling file. Invalid attribute for default: " + key + '. Valid attributes for default are "fixed_target" and "rate".');
          } else if (typeof config.default[key] !== "number") {
            throw new Error("Error in sampling file. Default " + key + " must be a number.");
          }
        }
        if (typeof config.default.fixed_target === "undefined") {
          missing.push("fixed_target");
        }
        if (typeof config.default.rate === "undefined") {
          missing.push("rate");
        }
        if (missing.length !== 0) {
          throw new Error("Error in sampling file. Missing required attributes for default: " + missing + ".");
        }
        defaultRule = { default: true, reservoir: new LocalReservoir(config.default.fixed_target, config.default.rate) };
      } else {
        throw new Error('Error in sampling file. Expecting "default" object to be defined with attributes "fixed_target" and "rate".');
      }
      if (Array.isArray(config.rules)) {
        config.rules.forEach(function(rawRule) {
          var params = {};
          var required;
          if (config.version === 2) {
            required = { host: 1, http_method: 1, url_path: 1, fixed_target: 1, rate: 1 };
          }
          if (config.version === 1) {
            required = { service_name: 1, http_method: 1, url_path: 1, fixed_target: 1, rate: 1 };
          }
          for (var key2 in rawRule) {
            var value = rawRule[key2];
            if (!required[key2] && key2 != "description") {
              throw new Error("Error in sampling file. Rule " + JSON.stringify(rawRule) + " has invalid attribute: " + key2 + ".");
            } else if (key2 != "description" && !value && value !== 0) {
              throw new Error("Error in sampling file. Rule " + JSON.stringify(rawRule) + ' attribute "' + key2 + '" has invalid value: ' + value + ".");
            } else {
              if (config.version === 2) {
                params[key2] = value;
              }
              if (config.version === 1 && key2 === "service_name") {
                params["host"] = value;
              } else {
                params[key2] = value;
              }
              delete required[key2];
            }
          }
          if (Object.keys(required).length !== 0 && required.constructor === Object) {
            throw new Error("Error in sampling file. Rule " + JSON.stringify(rawRule) + " is missing required attributes: " + Object.keys(required) + ".");
          }
          var rule = params;
          rule.reservoir = new LocalReservoir(rawRule.fixed_target, rawRule.rate);
          rules.push(rule);
        });
      }
      rules.push(defaultRule);
      return rules;
    };
    LocalSampler.setLocalRules();
    module2.exports = LocalSampler;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/reservoir.js
var require_reservoir = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/reservoir.js"(exports, module2) {
    "use strict";
    function Reservoir() {
      this.init();
    }
    Reservoir.prototype.init = function init() {
      this.quota = null;
      this.TTL = null;
      this.takenThisSec = 0;
      this.borrowedThisSec = 0;
      this.reportInterval = 1;
      this.reportElapsed = 0;
    };
    Reservoir.prototype.borrowOrTake = function borrowOrTake(now, canBorrow) {
      this.adjustThisSec(now);
      if (this.quota >= 0 && this.TTL >= now) {
        if (this.takenThisSec >= this.quota) {
          return false;
        }
        this.takenThisSec++;
        return "take";
      }
      if (canBorrow) {
        if (this.borrowedThisSec >= 1) {
          return false;
        }
        this.borrowedThisSec++;
        return "borrow";
      }
    };
    Reservoir.prototype.adjustThisSec = function adjustThisSec(now) {
      if (now !== this.thisSec) {
        this.takenThisSec = 0;
        this.borrowedThisSec = 0;
        this.thisSec = now;
      }
    };
    Reservoir.prototype.loadNewQuota = function loadNewQuota(quota, TTL, interval) {
      if (quota) {
        this.quota = quota;
      }
      if (TTL) {
        this.TTL = TTL;
      }
      if (interval) {
        this.reportInterval = interval / 10;
      }
    };
    Reservoir.prototype.timeToReport = function timeToReport() {
      if (this.reportElapsed + 1 >= this.reportInterval) {
        this.reportElapsed = 0;
        return true;
      } else {
        this.reportElapsed += 1;
        return false;
      }
    };
    module2.exports = Reservoir;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/sampling_rule.js
var require_sampling_rule = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/sampling_rule.js"(exports, module2) {
    "use strict";
    var Utils = require_utils3();
    var Reservoir = require_reservoir();
    function SamplingRule(name, priority, rate, reservoirSize, host, httpMethod, urlPath, serviceName, serviceType) {
      this.init(name, priority, rate, reservoirSize, host, httpMethod, urlPath, serviceName, serviceType);
    }
    SamplingRule.prototype.init = function init(name, priority, rate, reservoirSize, host, httpMethod, urlPath, serviceName, serviceType) {
      this.name = name;
      this.priority = priority;
      this.rate = rate;
      this.host = host;
      this.httpMethod = httpMethod;
      this.urlPath = urlPath;
      this.serviceName = serviceName;
      this.serviceType = serviceType;
      this.reservoir = new Reservoir();
      this.borrow = !!reservoirSize;
      this.resetStatistics();
    };
    SamplingRule.prototype.match = function match(sampleRequest) {
      var host = sampleRequest.host;
      var httpMethod = sampleRequest.httpMethod;
      var serviceName = sampleRequest.serviceName;
      var urlPath = sampleRequest.urlPath;
      var serviceType = sampleRequest.serviceType;
      return this.isDefault() || (!host || Utils.wildcardMatch(this.host, host)) && (!httpMethod || Utils.wildcardMatch(this.httpMethod, httpMethod)) && (!serviceName || Utils.wildcardMatch(this.serviceName, serviceName)) && (!urlPath || Utils.wildcardMatch(this.urlPath, urlPath)) && (!serviceType || Utils.wildcardMatch(this.serviceType, serviceType));
    };
    SamplingRule.prototype.snapshotStatistics = function snapshotStatistics() {
      var statistics = {
        requestCount: this.requestCount,
        borrowCount: this.borrowCount,
        sampledCount: this.sampledCount
      };
      this.resetStatistics();
      return statistics;
    };
    SamplingRule.prototype.merge = function merge(rule) {
      this.reservoir = rule.reservoir;
      this.requestCount = rule.requestCount;
      this.borrowCount = rule.borrowCount;
      this.sampledCount = rule.sampledCount;
      rule = null;
    };
    SamplingRule.prototype.isDefault = function isDefault() {
      return this.name === "Default";
    };
    SamplingRule.prototype.incrementRequestCount = function incrementRequestCount() {
      this.requestCount++;
    };
    SamplingRule.prototype.incrementBorrowCount = function incrementBorrowCount() {
      this.borrowCount++;
    };
    SamplingRule.prototype.incrementSampledCount = function incrementSampledCount() {
      this.sampledCount++;
    };
    SamplingRule.prototype.setRate = function setRate(rate) {
      this.rate = rate;
    };
    SamplingRule.prototype.getRate = function getRate() {
      return this.rate;
    };
    SamplingRule.prototype.getName = function getName() {
      return this.name;
    };
    SamplingRule.prototype.getPriority = function getPriority() {
      return this.priority;
    };
    SamplingRule.prototype.getReservoir = function getReservoir() {
      return this.reservoir;
    };
    SamplingRule.prototype.resetStatistics = function resetStatistics() {
      this.requestCount = 0;
      this.borrowCount = 0;
      this.sampledCount = 0;
    };
    SamplingRule.prototype.canBorrow = function canBorrow() {
      return this.borrow;
    };
    SamplingRule.prototype.everMatched = function everMatched() {
      return this.requestCount > 0;
    };
    SamplingRule.prototype.timeToReport = function timeToReport() {
      return this.reservoir.timeToReport();
    };
    module2.exports = SamplingRule;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/service_connector.js
var require_service_connector = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/service_connector.js"(exports, module2) {
    "use strict";
    var crypto = require("crypto");
    var logger2 = require_logger();
    var SamplingRule = require_sampling_rule();
    var DaemonConfig = require_daemon_config();
    var util = require("util");
    var http = require("http");
    var ServiceConnector = {
      // client_id is a 12 byte cryptographically secure random hex
      // identifying the SDK instance and is generated during SDK initialization/
      // This is required when reporting sampling to X-Ray back-end.
      clientId: crypto.randomBytes(12).toString("hex"),
      samplingRulesPath: "/GetSamplingRules",
      samplingTargetsPath: "/SamplingTargets",
      logger: logger2,
      httpClient: http,
      fetchSamplingRules: function fetchSamplingRules(callback) {
        const body = "{}";
        const options = getOptions(this.samplingRulesPath, body.length);
        const httpReq = this.httpClient.__request ? this.httpClient.__request : this.httpClient.request;
        const req = httpReq(options, (res) => {
          var data = "";
          res.on("data", (d) => {
            data += d;
          });
          res.on("error", (error) => {
            callback(error);
          });
          res.on("end", () => {
            var dataObj;
            try {
              dataObj = JSON.parse(data);
            } catch (err) {
              callback(err);
              return;
            }
            if (!dataObj) {
              callback(new Error("AWS X-Ray GetSamplingRules API returned empty response"));
              return;
            }
            var newRules = assembleRules(dataObj);
            callback(null, newRules);
          });
        });
        req.on("error", () => {
          callback(new Error(`Failed to connect to X-Ray daemon at ${options.hostname}:${options.port} to get sampling rules.`));
        });
        req.write(body);
        req.end();
      },
      fetchTargets: function fetchTargets(rules, callback) {
        const body = JSON.stringify(constructStatisticsDocs(rules));
        const options = getOptions(this.samplingTargetsPath, body.length);
        const httpReq = this.httpClient.__request ? this.httpClient.__request : this.httpClient.request;
        const req = httpReq(options, (res) => {
          var data = "";
          res.on("data", (d) => {
            data += d;
          });
          res.on("error", (error) => {
            callback(error);
          });
          res.on("end", () => {
            var dataObj;
            try {
              dataObj = JSON.parse(data);
            } catch (err) {
              callback(err);
              return;
            }
            if (!dataObj || typeof dataObj["LastRuleModification"] != "number") {
              callback(new Error("AWS X-Ray SamplingTargets API returned invalid response"));
              return;
            }
            var targetsMapping = assembleTargets(dataObj);
            var ruleFreshness = dateToEpoch(dataObj["LastRuleModification"]);
            callback(null, targetsMapping, ruleFreshness);
          });
        });
        req.on("error", () => {
          callback(new Error(`Failed to connect to X-Ray daemon at ${options.hostname}:${options.port} to get sampling targets.`));
        });
        req.write(body);
        req.end();
      }
    };
    var constructStatisticsDocs = function constructStatisticsDocs2(rules) {
      var documents = [];
      var now = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
      rules.forEach(function(rule) {
        var statistics = rule.snapshotStatistics();
        var doc = {
          "RuleName": rule.getName(),
          "ClientID": ServiceConnector.clientId,
          "RequestCount": statistics.requestCount,
          "BorrowCount": statistics.borrowCount,
          "SampledCount": statistics.sampledCount,
          "Timestamp": now
        };
        documents.push(doc);
      });
      return { SamplingStatisticsDocuments: documents };
    };
    var assembleRules = function assembleRules2(data) {
      var newRules = [];
      var ruleList = data["SamplingRuleRecords"] || [];
      ruleList.forEach(function(ruleRecord) {
        ruleRecord = ruleRecord["SamplingRule"];
        if (isRuleValid(ruleRecord)) {
          var newRule = new SamplingRule(ruleRecord["RuleName"], ruleRecord["Priority"], ruleRecord["FixedRate"], ruleRecord["ReservoirSize"], ruleRecord["Host"], ruleRecord["HTTPMethod"], ruleRecord["URLPath"], ruleRecord["ServiceName"], ruleRecord["ServiceType"]);
          newRules.push(newRule);
        }
      });
      return newRules;
    };
    var assembleTargets = function assembleTargets2(data) {
      var docs = data["SamplingTargetDocuments"] || [];
      var targetsMapping = {};
      docs.forEach(function(doc) {
        var newTarget = {
          rate: doc["FixedRate"],
          quota: doc["ReservoirQuota"],
          TTL: dateToEpoch(doc["ReservoirQuotaTTL"]),
          interval: doc["Interval"]
        };
        targetsMapping[doc["RuleName"]] = newTarget;
      });
      return targetsMapping;
    };
    var isRuleValid = function isRuleValid2(record) {
      return record["Version"] === 1 && record["ResourceARN"] === "*" && record["Attributes"] && Object.keys(record["Attributes"]).length === 0 && record["ServiceType"] && record["RuleName"] && record["Priority"] && typeof record["FixedRate"] == "number";
    };
    var dateToEpoch = function dateToEpoch2(date) {
      return new Date(date).getTime() / 1e3;
    };
    var getOptions = function getOptions2(path, contentLength) {
      const options = {
        hostname: DaemonConfig.tcp_ip,
        port: DaemonConfig.tcp_port,
        method: "POST",
        path,
        headers: {
          "Content-Type": "application/json",
          "Content-Length": contentLength,
          "Host": util.format("%s:%d", DaemonConfig.tcp_ip, DaemonConfig.tcp_port)
        }
      };
      return options;
    };
    module2.exports = ServiceConnector;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/rule_cache.js
var require_rule_cache = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/rule_cache.js"(exports, module2) {
    "use strict";
    var TTL = 60 * 60;
    var RuleCache = {
      rules: [],
      lastUpdated: null,
      /**
       * Tries to find a valid rule that matches the sample request.
       * @param {object} sampleRequest - Contains information for rules matching.
       * @param {number} now - Current epoch in seconds.
       * @module RuleCache
       * @function getMatchedRule
       */
      getMatchedRule: function getMatchedRule(sampleRequest, now) {
        if (isExpired(now)) {
          return null;
        }
        var matchedRule;
        this.rules.forEach(function(rule) {
          if (!matchedRule && rule.match(sampleRequest)) {
            matchedRule = rule;
          }
          if (rule.isDefault() && !matchedRule) {
            matchedRule = rule;
          }
        });
        return matchedRule;
      },
      /**
       * Load rules fetched from X-Ray service in order sorted by priorities.
       * @param {object} rules - Newly fetched rules to load.
       * @module RuleCache
       * @function loadRules
       */
      loadRules: function loadRules(rules) {
        var oldRules = {};
        this.rules.forEach(function(rule) {
          oldRules[rule.getName()] = rule;
        });
        this.rules = rules;
        this.rules.forEach(function(rule) {
          var oldRule = oldRules[rule.getName()];
          if (oldRule) {
            rule.merge(oldRule);
          }
        });
        this.rules.sort(function(a, b) {
          var v = a.getPriority() - b.getPriority();
          if (v !== 0) {
            return v;
          }
          if (a.getName() > b.getName()) {
            return 1;
          } else {
            return -1;
          }
        });
      },
      /**
       * Load targets fetched from X-Ray service.
       * @param {object} targetsMapping - Newly fetched targets map with rule name as key.
       * @module RuleCache
       * @function loadTargets
       */
      loadTargets: function loadTargets(targetsMapping) {
        this.rules.forEach(function(rule) {
          var target = targetsMapping[rule.getName()];
          if (target) {
            rule.getReservoir().loadNewQuota(target.quota, target.TTL, target.interval);
            rule.setRate(target.rate);
          }
        });
      },
      getRules: function getRules() {
        return this.rules;
      },
      timestamp: function timestamp(now) {
        this.lastUpdated = now;
      },
      getLastUpdated: function getLastUpdated() {
        return this.lastUpdated;
      }
    };
    var isExpired = function isExpired2(now) {
      if (!RuleCache.getLastUpdated()) {
        return true;
      }
      return now > RuleCache.getLastUpdated() + TTL;
    };
    module2.exports = RuleCache;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/rule_poller.js
var require_rule_poller = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/rule_poller.js"(exports, module2) {
    "use strict";
    var logger2 = require_logger();
    var ServiceConnector = require_service_connector();
    var ruleCache = require_rule_cache();
    var DEFAULT_INTERVAL = 5 * 60 * 1e3;
    var RulePoller = {
      start: function start() {
        if (this.poller) {
          clearInterval(this.poller);
        }
        refresh(false);
        this.poller = setInterval(refresh, DEFAULT_INTERVAL);
        this.poller.unref();
      }
    };
    var refresh = function refresh2(jitter) {
      jitter = typeof jitter === "undefined" ? true : jitter;
      if (jitter) {
        var delay = getJitter();
        setTimeout(refreshWithFirewall, delay);
      } else {
        refreshWithFirewall();
      }
    };
    var refreshWithFirewall = function refreshWithFirewall2() {
      try {
        refreshCache();
      } catch (e) {
        logger2.getLogger().warn("Encountered unexpected exception when fetching sampling rules: " + e);
      }
    };
    var refreshCache = function refreshCache2() {
      var now = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
      ServiceConnector.fetchSamplingRules(function(err, newRules) {
        if (err) {
          logger2.getLogger().warn("Failed to retrieve sampling rules from X-Ray service:", err);
        } else if (newRules.length !== 0) {
          ruleCache.loadRules(newRules);
          ruleCache.timestamp(now);
          logger2.getLogger().info("Successfully refreshed centralized sampling rule cache.");
        }
      });
    };
    var getJitter = function getJitter2() {
      return Math.random() * 5;
    };
    module2.exports = RulePoller;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/target_poller.js
var require_target_poller = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/target_poller.js"(exports, module2) {
    "use strict";
    var rulePoller = require_rule_poller();
    var serviceConnector = require_service_connector();
    var ruleCache = require_rule_cache();
    var logger2 = require_logger();
    var DEFAULT_INTERVAL = 10 * 1e3;
    var TargetPoller = {
      interval: DEFAULT_INTERVAL,
      start: function start() {
        this.poller = setInterval(refreshWithFirewall, DEFAULT_INTERVAL + getJitter());
        this.poller.unref();
      }
    };
    var refreshWithFirewall = function refreshWithFirewall2() {
      try {
        refresh();
      } catch (e) {
        logger2.getLogger().warn("Encountered unexpected exception when fetching sampling targets: " + e);
      }
    };
    var refresh = function refresh2() {
      var candidates = getCandidates();
      if (candidates && candidates.length > 0) {
        serviceConnector.fetchTargets(candidates, function(err, targetsMapping, ruleFreshness) {
          if (err) {
            logger2.getLogger().warn("Failed to retrieve sampling targets from X-Ray service:", err);
            return;
          }
          ruleCache.loadTargets(targetsMapping);
          if (ruleFreshness > ruleCache.getLastUpdated()) {
            logger2.getLogger().info("Performing out-of-band sampling rule polling to fetch updated rules.");
            rulePoller.start();
          }
          logger2.getLogger().info("Successfully reported rule statistics to get new sampling quota.");
        });
      }
    };
    var getCandidates = function getCandidates2() {
      var rules = ruleCache.getRules();
      var candidates = [];
      rules.forEach(function(rule) {
        if (rule.everMatched() && rule.timeToReport()) {
          candidates.push(rule);
        }
      });
      return candidates;
    };
    var getJitter = function getJitter2() {
      return Math.random() / TargetPoller.interval;
    };
    module2.exports = TargetPoller;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/default_sampler.js
var require_default_sampler = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/sampling/default_sampler.js"(exports, module2) {
    "use strict";
    var logger2 = require_logger();
    var util = require("util");
    var SegmentUtils = require_segment_utils();
    var DefaultSampler = {
      localSampler: require_local_sampler(),
      rulePoller: require_rule_poller(),
      targetPoller: require_target_poller(),
      ruleCache: require_rule_cache(),
      started: false,
      /**
       * Makes a sample decision based on the sample request.
       * @param {object} sampleRequest - Contains information for rules matching.
       * @module DefaultSampler
       * @function shouldSample
       */
      shouldSample: function shouldSample(sampleRequest) {
        try {
          if (!this.started) {
            this.start();
          }
          if (!sampleRequest.serviceType) {
            sampleRequest.serviceType = SegmentUtils.origin;
          }
          var now = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
          var matchedRule = this.ruleCache.getMatchedRule(sampleRequest, now);
          if (matchedRule) {
            logger2.getLogger().debug(util.format("Rule %s is matched.", matchedRule.getName()));
            return processMatchedRule(matchedRule, now);
          } else {
            logger2.getLogger().info("No effective centralized sampling rule match. Fallback to local rules.");
            return this.localSampler.shouldSample(sampleRequest);
          }
        } catch (err) {
          logger2.getLogger().error("Unhandled exception by the SDK during making sampling decisions: " + err);
        }
      },
      /**
       * Set local rules in case there is a need to fallback.
       * @module DefaultSampler
       * @function setLocalRules
       */
      setLocalRules: function setLocalRules(source) {
        this.localSampler.setLocalRules(source);
      },
      /**
       * Start the pollers to poll sampling rules and targets from X-Ray service.
       * @module DefaultSampler
       * @function start
       */
      start: function start() {
        if (!this.started) {
          this.rulePoller.start();
          this.targetPoller.start();
          this.started = true;
        }
      }
    };
    var processMatchedRule = function processMatchedRule2(rule, now) {
      rule.incrementRequestCount();
      var reservoir = rule.getReservoir();
      var sample = true;
      var decision = reservoir.borrowOrTake(now, rule.canBorrow());
      if (decision === "borrow") {
        rule.incrementBorrowCount();
      } else if (decision === "take") {
        rule.incrementSampledCount();
      } else if (Math.random() <= rule.getRate()) {
        rule.incrementSampledCount();
      } else {
        sample = false;
      }
      if (sample) {
        return rule.getName();
      } else {
        return false;
      }
    };
    module2.exports = DefaultSampler;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/mw_utils.js
var require_mw_utils = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/middleware/mw_utils.js"(exports, module2) {
    "use strict";
    var Segment = require_segment();
    var IncomingRequestData = require_incoming_request_data();
    var logger2 = require_logger();
    var coreUtils = require_utils3();
    var wildcardMatch = require_utils3().wildcardMatch;
    var processTraceData = require_utils3().processTraceData;
    var XRAY_HEADER = "x-amzn-trace-id";
    var overrideFlag = !!process.env.AWS_XRAY_TRACING_NAME;
    var utils = {
      defaultName: process.env.AWS_XRAY_TRACING_NAME,
      dynamicNaming: false,
      hostPattern: null,
      sampler: require_default_sampler(),
      /**
       * Enables dynamic naming for segments via the middleware. Use 'AWSXRay.middleware.enableDynamicNaming()'.
       * @param {string} [hostPattern] - The pattern to match the host header. See the README on dynamic and fixed naming modes.
       * @alias module:mw_utils.enableDynamicNaming
       */
      enableDynamicNaming: function(hostPattern) {
        this.dynamicNaming = true;
        if (hostPattern && typeof hostPattern !== "string") {
          throw new Error("Host pattern must be a string.");
        }
        this.hostPattern = hostPattern || null;
      },
      /**
       * Splits out the 'x-amzn-trace-id' header params from the incoming request.  Used by the middleware.
       * @param {http.IncomingMessage|https.IncomingMessage} req - The request object from the incoming call.
       * @returns {object}
       * @alias module:mw_utils.processHeaders
       */
      processHeaders: function processHeaders(req) {
        var amznTraceHeader = {};
        if (req && req.headers && req.headers[XRAY_HEADER]) {
          amznTraceHeader = processTraceData(req.headers[XRAY_HEADER]);
        }
        return amznTraceHeader;
      },
      /**
       * Resolves the name of the segment as determined by fixed or dynamic mode options. Used by the middleware.
       * @param {string} hostHeader - The string from the request.headers.host property.
       * @returns {string}
       * @alias module:mw_utils.resolveName
       */
      resolveName: function resolveName(hostHeader) {
        var name;
        if (this.dynamicNaming && hostHeader) {
          name = this.hostPattern ? wildcardMatch(this.hostPattern, hostHeader) ? hostHeader : this.defaultName : hostHeader;
        } else {
          name = this.defaultName;
        }
        return name;
      },
      /**
       * Resolves the sampling decision as determined by the values given and options set. Used by the middleware.
       * @param {object} amznTraceHeader - The object as returned by the processHeaders function.
       * @param {Segment} segment - The string from the request.headers.host property.
       * @param {http.ServerResponse|https.ServerResponse} res - The response object from the incoming call.
       * @returns {boolean}
       * @alias module:mw_utils.resolveSampling
       */
      resolveSampling: function resolveSampling(amznTraceHeader, segment, res) {
        var isSampled;
        if (amznTraceHeader.sampled === "1") {
          isSampled = true;
        } else if (amznTraceHeader.sampled === "0") {
          isSampled = false;
        } else {
          var sampleRequest = {
            host: res.req.headers.host,
            httpMethod: res.req.method,
            urlPath: res.req.url,
            serviceName: segment.name
          };
          isSampled = this.sampler.shouldSample(sampleRequest);
          if (isSampled instanceof String || typeof isSampled === "string") {
            segment.setMatchedSamplingRule(isSampled);
            isSampled = true;
          }
        }
        if (amznTraceHeader.sampled === "?") {
          res.header[XRAY_HEADER] = "Root=" + amznTraceHeader.root + ";Sampled=" + (isSampled ? "1" : "0");
        }
        if (!isSampled) {
          segment.notTraced = true;
        }
      },
      /**
       * Sets the default name of created segments. Used with the middleware.
       * Can be overridden by the AWS_XRAY_TRACING_NAME environment variable.
       * @param {string} name - The default name for segments created in the middleware.
       * @alias module:mw_utils.setDefaultName
       */
      setDefaultName: function setDefaultName(name) {
        if (!overrideFlag) {
          this.defaultName = name;
        }
      },
      disableCentralizedSampling: function disableCentralizedSampling() {
        this.sampler = require_local_sampler();
      },
      /**
       * Overrides the default sampling rules file to specify at what rate to sample at for specific routes.
       * The base sampling rules file can be found at /lib/resources/default_sampling_rules.json
       * @param {string|Object} source - The path to the custom sampling rules file, or the source JSON object.
       * @memberof AWSXRay
       */
      setSamplingRules: function setSamplingRules(source) {
        if (!source || source instanceof String || !(typeof source === "string" || source instanceof Object)) {
          throw new Error("Please specify a path to the local sampling rules file, or supply an object containing the rules.");
        }
        this.sampler.setLocalRules(source);
      },
      /**
       * Logs a debug message including core request and segment information
       * @param {string} message - The message to be logged
       * @param {string} url - The request url being traced
       * @param {Segment} - The current segment
       */
      middlewareLog: function middlewareLog(message, url, segment) {
        logger2.getLogger().debug(message + ": { url: " + url + ", name: " + segment.name + ", trace_id: " + segment.trace_id + ", id: " + segment.id + ", sampled: " + !segment.notTraced + " }");
      },
      /**
       * Traces the request/response cycle of an http.IncomingMessage / http.ServerResponse pair.
       * Resolves sampling rules, creates a segment, adds the core request / response data adding
       * throttling / error / fault flags based on the response status code.
       * @param {http.IncomingMessage} req - The incoming request.
       * @param {http.ServerResponse} res - The server response.
       * @returns {Segment}
       * @memberof AWSXRay
       */
      traceRequestResponseCycle: function traceRequestResponseCycle(req, res) {
        var amznTraceHeader = this.processHeaders(req);
        var name = this.resolveName(req.headers.host);
        var segment = new Segment(name, amznTraceHeader.root, amznTraceHeader.parent);
        var responseWithEmbeddedRequest = Object.assign({}, res, { req });
        this.resolveSampling(amznTraceHeader, segment, responseWithEmbeddedRequest);
        segment.addIncomingRequestData(new IncomingRequestData(req));
        this.middlewareLog("Starting middleware segment", req.url, segment);
        var middlewareLog = this.middlewareLog;
        var didEnd = false;
        var endSegment = function() {
          if (didEnd) {
            return;
          }
          didEnd = true;
          if (res.statusCode === 429) {
            segment.addThrottleFlag();
          }
          const cause = coreUtils.getCauseTypeFromHttpStatus(res.statusCode);
          if (cause) {
            segment[cause] = true;
          }
          segment.http.close(res);
          segment.close();
          middlewareLog("Closed middleware segment successfully", req.url, segment);
        };
        res.on("finish", endSegment);
        res.on("close", endSegment);
        return segment;
      }
    };
    module2.exports = utils;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/env/aws_lambda.js
var require_aws_lambda = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/env/aws_lambda.js"(exports, module2) {
    "use strict";
    var contextUtils = require_context_utils();
    var mwUtils = require_mw_utils();
    var LambdaUtils = require_utils3().LambdaUtils;
    var Segment = require_segment();
    var SegmentEmitter = require_segment_emitter();
    var SegmentUtils = require_segment_utils();
    var logger2 = require_logger();
    var TraceID = require_trace_id();
    var xAmznTraceIdPrev = null;
    module2.exports.init = function init() {
      contextUtils.enableManualMode = function() {
        logger2.getLogger().warn("AWS Lambda does not support AWS X-Ray manual mode.");
      };
      SegmentEmitter.disableReusableSocket();
      SegmentUtils.setStreamingThreshold(0);
      logger2.getLogger().info("Disabling centralized sampling in Lambda environment.");
      mwUtils.disableCentralizedSampling();
      var namespace = contextUtils.getNamespace();
      namespace.enter(namespace.createContext());
      contextUtils.setSegment(facadeSegment());
    };
    var facadeSegment = function facadeSegment2() {
      var segment = new Segment("facade");
      var whitelistFcn = ["addNewSubsegment", "addSubsegment", "removeSubsegment", "toString", "addSubsegmentWithoutSampling", "addNewSubsegmentWithoutSampling"];
      var silentFcn = ["incrementCounter", "decrementCounter", "isClosed", "close", "format", "flush"];
      var xAmznTraceId = process.env._X_AMZN_TRACE_ID;
      for (var key in segment) {
        if (typeof segment[key] === "function" && whitelistFcn.indexOf(key) === -1) {
          if (silentFcn.indexOf(key) === -1) {
            segment[key] = function() {
              var func = key;
              return function facade() {
                logger2.getLogger().warn('Function "' + func + '" cannot be called on an AWS Lambda segment. Please use a subsegment to record data.');
                return;
              };
            }();
          } else {
            segment[key] = function facade() {
              return;
            };
          }
        }
      }
      segment.trace_id = TraceID.Invalid().toString();
      segment.isClosed = function() {
        return true;
      };
      segment.in_progress = false;
      segment.counter = 1;
      segment.notTraced = true;
      segment.facade = true;
      segment.reset = function reset() {
        this.trace_id = TraceID.Invalid().toString();
        this.id = "00000000";
        delete this.subsegments;
        this.notTraced = true;
      };
      segment.resolveLambdaTraceData = function resolveLambdaTraceData() {
        var xAmznLambda = process.env._X_AMZN_TRACE_ID;
        if (xAmznLambda) {
          if (xAmznLambda != xAmznTraceIdPrev) {
            this.reset();
            if (LambdaUtils.populateTraceData(segment, xAmznLambda)) {
              xAmznTraceIdPrev = xAmznLambda;
            }
          }
        } else {
          this.reset();
          contextUtils.contextMissingStrategy.contextMissing("Missing AWS Lambda trace data for X-Ray. Ensure Active Tracing is enabled and no subsegments are created outside the function handler.");
        }
      };
      if (LambdaUtils.validTraceData(xAmznTraceId)) {
        if (LambdaUtils.populateTraceData(segment, xAmznTraceId)) {
          xAmznTraceIdPrev = xAmznTraceId;
        }
      }
      return segment;
    };
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/package.json
var require_package = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/package.json"(exports, module2) {
    module2.exports = {
      name: "aws-xray-sdk-core",
      version: "3.5.3",
      description: "AWS X-Ray SDK for Javascript",
      author: "Amazon Web Services",
      contributors: [
        "Sandra McMullen <mcmuls@amazon.com>",
        "William Armiros <armiros@amazon.com>",
        "Moritz Onken <onken@netcubed.de>"
      ],
      files: [
        "dist/lib/**/*",
        "LICENSE",
        "README.md"
      ],
      main: "dist/lib/index.js",
      types: "dist/lib/index.d.ts",
      engines: {
        node: ">= 14.x"
      },
      directories: {
        test: "test"
      },
      "//": "@types/cls-hooked is exposed in API so must be in dependencies, not devDependencies",
      dependencies: {
        "@aws-sdk/types": "^3.4.1",
        "@smithy/service-error-classification": "^2.0.4",
        "@types/cls-hooked": "^4.3.3",
        "atomic-batcher": "^1.0.2",
        "cls-hooked": "^4.2.2",
        semver: "^7.5.3"
      },
      scripts: {
        prepare: "npm run compile",
        compile: "tsc && npm run copy-lib && npm run copy-test",
        "copy-lib": "find lib -type f \\( -name '*.d.ts' -o -name '*.json' \\) | xargs -I % ../../scripts/cp-with-structure.sh % dist",
        "copy-test": "find test -name '*.json' | xargs -I % ../../scripts/cp-with-structure.sh % dist",
        lint: "eslint .",
        "lint:fix": "eslint . --fix",
        test: "npm run compile && mocha --recursive ./dist/test/ -R spec && tsd && mocha --recursive ./dist/test_async/ -R spec",
        "test-d": "tsd",
        "test-async": "npm run compile && mocha --recursive ./dist/test_async/ -R spec",
        clean: "rm -rf dist && rm -rf node_modules",
        testcov: "nyc npm run test",
        reportcov: "nyc report --reporter=text-lcov > coverage.lcov && codecov"
      },
      keywords: [
        "amazon",
        "api",
        "aws",
        "core",
        "xray",
        "x-ray",
        "x ray"
      ],
      license: "Apache-2.0",
      repository: "https://github.com/aws/aws-xray-sdk-node/tree/master/packages/core",
      gitHead: "b6fb64960486d1ea4acd7fdf959e90ff52a774ea"
    };
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/plugin.js
var require_plugin = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/plugin.js"(exports, module2) {
    "use strict";
    var http = require("http");
    var Plugin = {
      METADATA_TIMEOUT: 1e3,
      /**
       * Asynchronously retrieves metadata from on-instance endpoint with an HTTP request using retries for
       * requests that time out.
       * @param {object} options - The HTTP options to make the request with
       * @param {function} callback - callback to plugin
       */
      getPluginMetadata: function(options, callback) {
        const METADATA_RETRY_TIMEOUT = 250;
        const METADATA_RETRIES = 5;
        var retries = METADATA_RETRIES;
        var getMetadata = function() {
          var httpReq = http.__request ? http.__request : http.request;
          var req = httpReq(options, function(res) {
            var body = "";
            res.on("data", function(chunk) {
              body += chunk;
            });
            res.on("end", function() {
              if (this.statusCode === 200 || this.statusCode === 300) {
                try {
                  body = JSON.parse(body);
                } catch (e) {
                  callback(e);
                  return;
                }
                callback(null, body);
              } else if (retries > 0 && Math.floor(this.statusCode / 100) === 5) {
                retries--;
                setTimeout(getMetadata, METADATA_RETRY_TIMEOUT);
              } else {
                callback(new Error(`Failed to retrieve metadata with options: ${options}`));
              }
            });
          });
          req.on("error", function(err) {
            callback(err);
          });
          req.on("timeout", function() {
            req.abort();
          });
          req.setTimeout(Plugin.METADATA_TIMEOUT);
          req.end();
        };
        getMetadata();
      }
    };
    module2.exports = Plugin;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/ec2_plugin.js
var require_ec2_plugin = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/ec2_plugin.js"(exports, module2) {
    "use strict";
    var Plugin = require_plugin();
    var logger2 = require_logger();
    var http = require("http");
    var EC2Plugin = {
      /**
       * A function to get the instance data from the EC2 metadata service.
       * @param {function} callback - The callback for the plugin loader.
       */
      getData: function(callback) {
        const METADATA_PATH = "/latest/dynamic/instance-identity/document";
        function populateMetadata(token) {
          const options = getOptions(METADATA_PATH, "GET", token ? { "X-aws-ec2-metadata-token": token } : {});
          Plugin.getPluginMetadata(options, function(err, data) {
            if (err || !data) {
              logger2.getLogger().error("Error loading EC2 plugin metadata: ", err ? err.toString() : "Could not retrieve data from IMDS.");
              callback();
              return;
            }
            const metadata = {
              ec2: {
                instance_id: data.instanceId,
                availability_zone: data.availabilityZone,
                instance_size: data.instanceType,
                ami_id: data.imageId
              }
            };
            callback(metadata);
          });
        }
        getToken(function(token) {
          if (token === null) {
            logger2.getLogger().debug("EC2Plugin failed to get token from IMDSv2. Falling back to IMDSv1.");
          }
          populateMetadata(token);
        });
      },
      originName: "AWS::EC2::Instance"
    };
    function getToken(callback) {
      const httpReq = http.__request ? http.__request : http.request;
      const TTL = 60;
      const TOKEN_PATH = "/latest/api/token";
      const options = getOptions(TOKEN_PATH, "PUT", {
        "X-aws-ec2-metadata-token-ttl-seconds": TTL
      });
      let req = httpReq(options, function(res) {
        let body = "";
        res.on("data", function(chunk) {
          body += chunk;
        });
        res.on("end", function() {
          if (this.statusCode === 200 || this.statusCode === 300) {
            callback(body);
          } else {
            callback(null);
          }
        });
      });
      req.on("error", function() {
        callback(null);
      });
      req.on("timeout", function() {
        req.abort();
        callback(null);
      });
      req.setTimeout(Plugin.METADATA_TIMEOUT);
      req.end();
    }
    function getOptions(path, method, headers) {
      if (!method) {
        method = "GET";
      }
      if (!headers) {
        headers = {};
      }
      return {
        host: "169.254.169.254",
        path,
        method,
        headers
      };
    }
    module2.exports = EC2Plugin;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/ecs_plugin.js
var require_ecs_plugin = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/ecs_plugin.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var ECSPlugin = {
      /**
       * A function to get the instance data from the ECS instance.
       * @param {function} callback - The callback for the plugin loader.
       */
      getData: function(callback) {
        callback({ ecs: { container: os.hostname() } });
      },
      originName: "AWS::ECS::Container"
    };
    module2.exports = ECSPlugin;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/elastic_beanstalk_plugin.js
var require_elastic_beanstalk_plugin = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/plugins/elastic_beanstalk_plugin.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var logger2 = require_logger();
    var ENV_CONFIG_LOCATION = "/var/elasticbeanstalk/xray/environment.conf";
    var ElasticBeanstalkPlugin = {
      /**
       * A function to get data from the Elastic Beanstalk environment configuration file.
       * @param {function} callback - The callback for the plugin loader.
       */
      getData: function(callback) {
        fs.readFile(ENV_CONFIG_LOCATION, "utf8", function(err, rawData) {
          if (err) {
            logger2.getLogger().error("Error loading Elastic Beanstalk plugin:", err.stack);
            callback();
          } else {
            var data = JSON.parse(rawData);
            var metadata = {
              elastic_beanstalk: {
                environment: data.environment_name,
                version_label: data.version_label,
                deployment_id: data.deployment_id
              }
            };
            callback(metadata);
          }
        });
      },
      originName: "AWS::ElasticBeanstalk::Environment"
    };
    module2.exports = ElasticBeanstalkPlugin;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/resources/aws_whitelist.json
var require_aws_whitelist = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/resources/aws_whitelist.json"(exports, module2) {
    module2.exports = {
      services: {
        dynamodb: {
          operations: {
            batchGetItem: {
              request_descriptors: {
                RequestItems: {
                  get_keys: true,
                  rename_to: "table_names"
                }
              },
              response_parameters: [
                "ConsumedCapacity"
              ]
            },
            batchWriteItem: {
              request_descriptors: {
                RequestItems: {
                  get_keys: true,
                  rename_to: "table_names"
                }
              },
              response_parameters: [
                "ConsumedCapacity",
                "ItemCollectionMetrics"
              ]
            },
            createTable: {
              request_parameters: [
                "GlobalSecondaryIndexes",
                "LocalSecondaryIndexes",
                "ProvisionedThroughput",
                "TableName"
              ]
            },
            deleteItem: {
              request_parameters: [
                "TableName"
              ],
              response_parameters: [
                "ConsumedCapacity",
                "ItemCollectionMetrics"
              ]
            },
            deleteTable: {
              request_parameters: [
                "TableName"
              ]
            },
            describeTable: {
              request_parameters: [
                "TableName"
              ]
            },
            getItem: {
              request_parameters: [
                "ConsistentRead",
                "ProjectionExpression",
                "TableName"
              ],
              response_parameters: [
                "ConsumedCapacity"
              ]
            },
            listTables: {
              request_parameters: [
                "ExclusiveStartTableName",
                "Limit"
              ],
              response_descriptors: {
                TableNames: {
                  list: true,
                  get_count: true,
                  rename_to: "table_count"
                }
              }
            },
            putItem: {
              request_parameters: [
                "TableName"
              ],
              response_parameters: [
                "ConsumedCapacity",
                "ItemCollectionMetrics"
              ]
            },
            query: {
              request_parameters: [
                "AttributesToGet",
                "ConsistentRead",
                "IndexName",
                "Limit",
                "ProjectionExpression",
                "ScanIndexForward",
                "Select",
                "TableName"
              ],
              response_parameters: [
                "ConsumedCapacity"
              ]
            },
            scan: {
              request_parameters: [
                "AttributesToGet",
                "ConsistentRead",
                "IndexName",
                "Limit",
                "ProjectionExpression",
                "Segment",
                "Select",
                "TableName",
                "TotalSegments"
              ],
              response_parameters: [
                "ConsumedCapacity",
                "Count",
                "ScannedCount"
              ]
            },
            updateItem: {
              request_parameters: [
                "TableName"
              ],
              response_parameters: [
                "ConsumedCapacity",
                "ItemCollectionMetrics"
              ]
            },
            updateTable: {
              request_parameters: [
                "AttributeDefinitions",
                "GlobalSecondaryIndexUpdates",
                "ProvisionedThroughput",
                "TableName"
              ]
            }
          }
        },
        sqs: {
          operations: {
            addPermission: {
              request_parameters: [
                "Label",
                "QueueUrl"
              ]
            },
            changeMessageVisibility: {
              request_parameters: [
                "QueueUrl",
                "VisibilityTimeout"
              ]
            },
            changeMessageVisibilityBatch: {
              request_parameters: [
                "QueueUrl"
              ],
              response_parameters: [
                "Failed"
              ]
            },
            createQueue: {
              request_parameters: [
                "Attributes",
                "QueueName"
              ]
            },
            deleteMessage: {
              request_parameters: [
                "QueueUrl"
              ]
            },
            deleteMessageBatch: {
              request_parameters: [
                "QueueUrl"
              ],
              response_parameters: [
                "Failed"
              ]
            },
            deleteQueue: {
              request_parameters: [
                "QueueUrl"
              ]
            },
            getQueueAttributes: {
              request_parameters: [
                "QueueUrl"
              ],
              response_parameters: [
                "Attributes"
              ]
            },
            getQueueUrl: {
              request_parameters: [
                "QueueName",
                "QueueOwnerAWSAccountId"
              ],
              response_parameters: [
                "QueueUrl"
              ]
            },
            listDeadLetterSourceQueues: {
              request_parameters: [
                "QueueUrl"
              ],
              response_parameters: [
                "QueueUrls"
              ]
            },
            listQueues: {
              request_parameters: [
                "QueueNamePrefix"
              ],
              response_descriptors: {
                QueueUrls: {
                  list: true,
                  get_count: true,
                  rename_to: "queue_count"
                }
              }
            },
            purgeQueue: {
              request_parameters: [
                "QueueUrl"
              ]
            },
            receiveMessage: {
              request_parameters: [
                "AttributeNames",
                "MaxNumberOfMessages",
                "MessageAttributeNames",
                "QueueUrl",
                "VisibilityTimeout",
                "WaitTimeSeconds"
              ],
              response_descriptors: {
                Messages: {
                  list: true,
                  get_count: true,
                  rename_to: "message_count"
                }
              }
            },
            removePermission: {
              request_parameters: [
                "QueueUrl"
              ]
            },
            sendMessage: {
              request_parameters: [
                "DelaySeconds",
                "QueueUrl"
              ],
              request_descriptors: {
                MessageAttributes: {
                  get_keys: true,
                  rename_to: "message_attribute_names"
                }
              },
              response_parameters: [
                "MessageId"
              ]
            },
            sendMessageBatch: {
              request_parameters: [
                "QueueUrl"
              ],
              request_descriptors: {
                Entries: {
                  list: true,
                  get_count: true,
                  rename_to: "message_count"
                }
              },
              response_descriptors: {
                Failed: {
                  list: true,
                  get_count: true,
                  rename_to: "failed_count"
                },
                Successful: {
                  list: true,
                  get_count: true,
                  rename_to: "successful_count"
                }
              }
            },
            setQueueAttributes: {
              request_parameters: [
                "QueueUrl"
              ],
              request_descriptors: {
                Attributes: {
                  get_keys: true,
                  rename_to: "attribute_names"
                }
              }
            }
          }
        },
        sns: {
          operations: {
            publish: {
              request_parameters: [
                "TopicArn"
              ]
            },
            publishBatch: {
              request_parameters: [
                "TopicArn"
              ]
            }
          }
        },
        lambda: {
          operations: {
            invoke: {
              request_parameters: [
                "FunctionName",
                "InvocationType",
                "LogType",
                "Qualifier"
              ],
              response_parameters: [
                "FunctionError",
                "StatusCode"
              ]
            },
            invokeAsync: {
              request_parameters: [
                "FunctionName"
              ],
              response_parameters: [
                "Status"
              ]
            }
          }
        },
        s3: {
          operations: {
            abortMultipartUpload: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            completeMultipartUpload: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            copyObject: {
              request_parameters: [
                "CopySource",
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            createBucket: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            createMultipartUpload: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucket: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketAnalyticsConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketCors: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketEncryption: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketInventoryConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketLifecycle: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketMetricsConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketPolicy: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketReplication: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketTagging: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteBucketWebsite: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteObject: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteObjectTagging: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            deleteObjects: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketAccelerateConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketAcl: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketAnalyticsConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketCors: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketEncryption: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketInventoryConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketLifecycle: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketLifecycleConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketLocation: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketLogging: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketMetricsConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketNotification: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketNotificationConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketPolicy: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketReplication: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketRequestPayment: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketTagging: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketVersioning: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getBucketWebsite: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getObject: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getObjectAcl: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getObjectTagging: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            getObjectTorrent: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            headBucket: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            headObject: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listBucketAnalyticsConfigurations: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listBucketInventoryConfigurations: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listBucketMetricsConfigurations: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listMultipartUploads: {
              request_parameters: [
                "Prefix"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listObjectVersions: {
              request_parameters: [
                "Prefix"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listObjects: {
              request_parameters: [
                "Prefix"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listObjectsV2: {
              request_parameters: [
                "Prefix"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            listParts: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketAccelerateConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketAcl: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketAnalyticsConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketCors: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketEncryption: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketInventoryConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketLifecycle: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketLifecycleConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketLogging: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketMetricsConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketNotification: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketNotificationConfiguration: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketPolicy: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketReplication: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketRequestPayment: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketTagging: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketVersioning: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putBucketWebsite: {
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putObject: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putObjectAcl: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            putObjectTagging: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            restoreObject: {
              request_parameters: [
                "Key",
                "VersionId"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            uploadPart: {
              request_parameters: [
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            },
            uploadPartCopy: {
              request_parameters: [
                "CopySource",
                "Key"
              ],
              request_descriptors: {
                Bucket: {
                  rename_to: "bucket_name"
                }
              }
            }
          }
        },
        sagemakerruntime: {
          operations: {
            invokeEndpoint: {
              request_parameters: [
                "EndpointName"
              ]
            }
          }
        }
      }
    };
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/call_capturer.js
var require_call_capturer = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/call_capturer.js"(exports, module2) {
    "use strict";
    var fs = require("fs");
    var logger2 = require_logger();
    var whitelist = require_aws_whitelist();
    var paramTypes = {
      REQ_DESC: "request_descriptors",
      REQ_PARAMS: "request_parameters",
      RES_DESC: "response_descriptors",
      RES_PARAMS: "response_parameters"
    };
    function CallCapturer(source) {
      this.init(source);
    }
    CallCapturer.prototype.init = function init(source) {
      if (source) {
        if (typeof source === "string") {
          logger2.getLogger().info("Using custom AWS whitelist file: " + source);
          this.services = loadWhitelist(JSON.parse(fs.readFileSync(source, "utf8")));
        } else {
          logger2.getLogger().info("Using custom AWS whitelist source.");
          this.services = loadWhitelist(source);
        }
      } else {
        this.services = whitelist.services;
      }
    };
    CallCapturer.prototype.append = function append(source) {
      var newServices = {};
      if (typeof source === "string") {
        logger2.getLogger().info("Appending AWS whitelist with custom file: " + source);
        newServices = loadWhitelist(JSON.parse(fs.readFileSync(source, "utf8")));
      } else {
        logger2.getLogger().info("Appending AWS whitelist with a custom source.");
        newServices = loadWhitelist(source);
      }
      for (var attribute in newServices) {
        this.services[attribute] = newServices[attribute];
      }
    };
    CallCapturer.prototype.capture = function capture(serviceName, response) {
      var operation = response.request.operation;
      var call = this.services[serviceName] !== void 0 ? this.services[serviceName].operations[operation] : null;
      if (call === null) {
        logger2.getLogger().debug('Call "' + serviceName + "." + operation + '" is not whitelisted for additional data capturing. Ignoring.');
        return;
      }
      var dataCaptured = {};
      for (var paramType in call) {
        var params = call[paramType];
        if (paramType === paramTypes.REQ_PARAMS) {
          captureCallParams(params, response.request.params, dataCaptured);
        } else if (paramType === paramTypes.REQ_DESC) {
          captureDescriptors(params, response.request.params, dataCaptured);
        } else if (paramType === paramTypes.RES_PARAMS) {
          if (response.data) {
            captureCallParams(params, response.data, dataCaptured);
          }
        } else if (paramType === paramTypes.RES_DESC) {
          if (response.data) {
            captureDescriptors(params, response.data, dataCaptured);
          }
        } else {
          logger2.getLogger().error('Unknown parameter type "' + paramType + '". Must be "request_descriptors", "response_descriptors", "request_parameters" or "response_parameters".');
        }
      }
      return dataCaptured;
    };
    function captureCallParams(params, call, data) {
      params.forEach(function(param) {
        if (typeof call[param] !== "undefined") {
          var formatted = toSnakeCase(param);
          this[formatted] = call[param];
        }
      }, data);
    }
    function captureDescriptors(descriptors, params, data) {
      for (var paramName in descriptors) {
        var attributes = descriptors[paramName];
        if (typeof params[paramName] !== "undefined") {
          var paramData;
          if (attributes.list && attributes.get_count) {
            paramData = params[paramName] ? params[paramName].length : 0;
          } else {
            paramData = attributes.get_keys === true ? Object.keys(params[paramName]) : params[paramName];
          }
          if (typeof attributes.rename_to === "string") {
            data[attributes.rename_to] = paramData;
          } else {
            var formatted = toSnakeCase(paramName);
            data[formatted] = paramData;
          }
        }
      }
    }
    function toSnakeCase(param) {
      if (param === "IPAddress") {
        return "ip_address";
      } else {
        return param.split(/(?=[A-Z])/).join("_").toLowerCase();
      }
    }
    function loadWhitelist(source) {
      var doc = source;
      if (doc.services === void 0) {
        throw new Error('Document formatting is incorrect. Expecting "services" param.');
      }
      return doc.services;
    }
    module2.exports = CallCapturer;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/aws.js
var require_aws = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/segments/attributes/aws.js"(exports, module2) {
    "use strict";
    var CallCapturer = require_call_capturer();
    var capturer = new CallCapturer();
    function Aws(res, serviceName) {
      this.init(res, serviceName);
    }
    Aws.prototype.init = function init(res, serviceName) {
      this.operation = formatOperation(res.request.operation) || "";
      if (res && res.request && res.request.httpRequest && res.request.httpRequest.region) {
        this.region = res.request.httpRequest.region;
      }
      if (res && res.requestId) {
        this.request_id = res.requestId;
      }
      this.retries = res.retryCount || 0;
      if (res.extendedRequestId && serviceName && serviceName.toLowerCase() === "s3") {
        this.id_2 = res.extendedRequestId;
      }
      if (serviceName) {
        this.addData(capturer.capture(serviceName.toLowerCase(), res));
      }
    };
    Aws.prototype.addData = function addData(data) {
      for (var attribute in data) {
        this[attribute] = data[attribute];
      }
    };
    var setAWSWhitelist = function setAWSWhitelist2(source) {
      if (!source || source instanceof String || !(typeof source === "string" || source instanceof Object)) {
        throw new Error("Please specify a path to the local whitelist file, or supply a whitelist source object.");
      }
      capturer = new CallCapturer(source);
    };
    var appendAWSWhitelist = function appendAWSWhitelist2(source) {
      if (!source || source instanceof String || !(typeof source === "string" || source instanceof Object)) {
        throw new Error("Please specify a path to the local whitelist file, or supply a whitelist source object.");
      }
      capturer.append(source);
    };
    function formatOperation(operation) {
      if (!operation) {
        return;
      }
      return operation.charAt(0).toUpperCase() + operation.slice(1);
    }
    module2.exports = Aws;
    module2.exports.appendAWSWhitelist = appendAWSWhitelist;
    module2.exports.setAWSWhitelist = setAWSWhitelist;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/capture.js
var require_capture = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/capture.js"(exports, module2) {
    "use strict";
    var contextUtils = require_context_utils();
    var logger2 = require_logger();
    var captureFunc = function captureFunc2(name, fcn, parent) {
      validate(name, fcn);
      var current, executeFcn;
      var parentSeg = contextUtils.resolveSegment(parent);
      if (!parentSeg) {
        logger2.getLogger().warn("Failed to capture function.");
        return fcn();
      }
      current = parentSeg.addNewSubsegment(name);
      executeFcn = captureFcn(fcn, current);
      try {
        const response = executeFcn(current);
        current.close();
        return response;
      } catch (e) {
        current.close(e);
        throw e;
      }
    };
    var captureAsyncFunc = function captureAsyncFunc2(name, fcn, parent) {
      validate(name, fcn);
      var current, executeFcn;
      var parentSeg = contextUtils.resolveSegment(parent);
      if (!parentSeg) {
        logger2.getLogger().warn("Failed to capture async function.");
        return fcn();
      }
      current = parentSeg.addNewSubsegment(name);
      executeFcn = captureFcn(fcn, current);
      try {
        return executeFcn(current);
      } catch (e) {
        current.close(e);
        throw e;
      }
    };
    var captureCallbackFunc = function captureCallbackFunc2(name, fcn, parent) {
      validate(name, fcn);
      var base = contextUtils.resolveSegment(parent);
      if (!base) {
        logger2.getLogger().warn("Failed to capture callback function.");
        return fcn;
      }
      base.incrementCounter();
      return function() {
        var parentSeg = contextUtils.resolveSegment(parent);
        var args = Array.prototype.slice.call(arguments);
        captureFunc(name, fcn.bind.apply(fcn, [null].concat(args)), parentSeg);
        base.decrementCounter();
      }.bind(this);
    };
    function captureFcn(fcn, current) {
      var executeFcn;
      if (contextUtils.isAutomaticMode()) {
        var session = contextUtils.getNamespace();
        var contextFcn = function() {
          var value;
          session.run(function() {
            contextUtils.setSegment(current);
            value = fcn(current);
          });
          return value;
        };
        executeFcn = contextFcn;
      } else {
        executeFcn = fcn;
      }
      return executeFcn;
    }
    function validate(name, fcn) {
      var error;
      if (!name || typeof name !== "string") {
        error = 'Param "name" must be a non-empty string.';
        logger2.getLogger().error(error);
        throw new Error(error);
      } else if (typeof fcn !== "function") {
        error = 'Param "fcn" must be a function.';
        logger2.getLogger().error(error);
        throw new Error(error);
      }
    }
    module2.exports.captureFunc = captureFunc;
    module2.exports.captureAsyncFunc = captureAsyncFunc;
    module2.exports.captureCallbackFunc = captureCallbackFunc;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/constants.js
var require_constants3 = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/constants.js"(exports, module2) {
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/debug.js"(exports, module2) {
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/re.js
var require_re = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/re.js"(exports, module2) {
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants3();
    var debug = require_debug();
    exports = module2.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NUMERICIDENTIFIER]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NUMERICIDENTIFIERLOOSE]}|${src[t.NONNUMERICIDENTIFIER]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCE", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/parse-options.js"(exports, module2) {
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/internal/identifiers.js"(exports, module2) {
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/classes/semver.js"(exports, module2) {
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants3();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
      }
      comparePre(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof SemVer)) {
          other = new SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (!identifier && identifierBase === false) {
              throw new Error("invalid increment argument: identifier is empty");
            }
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/parse.js"(exports, module2) {
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/valid.js"(exports, module2) {
    var parse = require_parse();
    var valid = (version, options) => {
      const v = parse(version, options);
      return v ? v.version : null;
    };
    module2.exports = valid;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/clean.js"(exports, module2) {
    var parse = require_parse();
    var clean = (version, options) => {
      const s = parse(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module2.exports = clean;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/inc.js"(exports, module2) {
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module2.exports = inc;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/diff.js"(exports, module2) {
    var parse = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse(version1, null, true);
      const v2 = parse(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (highVersion.patch) {
          return "patch";
        }
        if (highVersion.minor) {
          return "minor";
        }
        return "major";
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module2.exports = diff;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/major.js
var require_major = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/major.js"(exports, module2) {
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module2.exports = major;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/minor.js"(exports, module2) {
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module2.exports = minor;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/patch.js"(exports, module2) {
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module2.exports = patch;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/prerelease.js"(exports, module2) {
    var parse = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module2.exports = prerelease;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/compare.js"(exports, module2) {
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/rcompare.js"(exports, module2) {
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module2.exports = rcompare;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/compare-loose.js"(exports, module2) {
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module2.exports = compareLoose;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/compare-build.js"(exports, module2) {
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module2.exports = compareBuild;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/sort.js"(exports, module2) {
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module2.exports = sort;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/rsort.js"(exports, module2) {
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module2.exports = rsort;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/gt.js"(exports, module2) {
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/lt.js"(exports, module2) {
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/eq.js"(exports, module2) {
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/neq.js"(exports, module2) {
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/gte.js"(exports, module2) {
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/lte.js"(exports, module2) {
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/cmp.js"(exports, module2) {
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/coerce.js"(exports, module2) {
    var SemVer = require_semver();
    var parse = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(re[t.COERCE]);
      } else {
        let next;
        while ((next = re[t.COERCERTL].exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
        }
        re[t.COERCERTL].lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      return parse(`${match[2]}.${match[3] || "0"}.${match[4] || "0"}`, options);
    };
    module2.exports = coerce;
  }
});

// ../node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/iterator.js
var require_iterator = __commonJS({
  "../node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/iterator.js"(exports, module2) {
    "use strict";
    module2.exports = function(Yallist) {
      Yallist.prototype[Symbol.iterator] = function* () {
        for (let walker = this.head; walker; walker = walker.next) {
          yield walker.value;
        }
      };
    };
  }
});

// ../node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/yallist.js
var require_yallist = __commonJS({
  "../node_modules/.pnpm/yallist@4.0.0/node_modules/yallist/yallist.js"(exports, module2) {
    "use strict";
    module2.exports = Yallist;
    Yallist.Node = Node;
    Yallist.create = Yallist;
    function Yallist(list) {
      var self2 = this;
      if (!(self2 instanceof Yallist)) {
        self2 = new Yallist();
      }
      self2.tail = null;
      self2.head = null;
      self2.length = 0;
      if (list && typeof list.forEach === "function") {
        list.forEach(function(item) {
          self2.push(item);
        });
      } else if (arguments.length > 0) {
        for (var i = 0, l = arguments.length; i < l; i++) {
          self2.push(arguments[i]);
        }
      }
      return self2;
    }
    Yallist.prototype.removeNode = function(node) {
      if (node.list !== this) {
        throw new Error("removing node which does not belong to this list");
      }
      var next = node.next;
      var prev = node.prev;
      if (next) {
        next.prev = prev;
      }
      if (prev) {
        prev.next = next;
      }
      if (node === this.head) {
        this.head = next;
      }
      if (node === this.tail) {
        this.tail = prev;
      }
      node.list.length--;
      node.next = null;
      node.prev = null;
      node.list = null;
      return next;
    };
    Yallist.prototype.unshiftNode = function(node) {
      if (node === this.head) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var head = this.head;
      node.list = this;
      node.next = head;
      if (head) {
        head.prev = node;
      }
      this.head = node;
      if (!this.tail) {
        this.tail = node;
      }
      this.length++;
    };
    Yallist.prototype.pushNode = function(node) {
      if (node === this.tail) {
        return;
      }
      if (node.list) {
        node.list.removeNode(node);
      }
      var tail = this.tail;
      node.list = this;
      node.prev = tail;
      if (tail) {
        tail.next = node;
      }
      this.tail = node;
      if (!this.head) {
        this.head = node;
      }
      this.length++;
    };
    Yallist.prototype.push = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        push(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.unshift = function() {
      for (var i = 0, l = arguments.length; i < l; i++) {
        unshift(this, arguments[i]);
      }
      return this.length;
    };
    Yallist.prototype.pop = function() {
      if (!this.tail) {
        return void 0;
      }
      var res = this.tail.value;
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      } else {
        this.head = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.shift = function() {
      if (!this.head) {
        return void 0;
      }
      var res = this.head.value;
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      } else {
        this.tail = null;
      }
      this.length--;
      return res;
    };
    Yallist.prototype.forEach = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.head, i = 0; walker !== null; i++) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.next;
      }
    };
    Yallist.prototype.forEachReverse = function(fn, thisp) {
      thisp = thisp || this;
      for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
        fn.call(thisp, walker.value, i, this);
        walker = walker.prev;
      }
    };
    Yallist.prototype.get = function(n) {
      for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
        walker = walker.next;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.getReverse = function(n) {
      for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
        walker = walker.prev;
      }
      if (i === n && walker !== null) {
        return walker.value;
      }
    };
    Yallist.prototype.map = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.head; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.next;
      }
      return res;
    };
    Yallist.prototype.mapReverse = function(fn, thisp) {
      thisp = thisp || this;
      var res = new Yallist();
      for (var walker = this.tail; walker !== null; ) {
        res.push(fn.call(thisp, walker.value, this));
        walker = walker.prev;
      }
      return res;
    };
    Yallist.prototype.reduce = function(fn, initial) {
      var acc;
      var walker = this.head;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.head) {
        walker = this.head.next;
        acc = this.head.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = 0; walker !== null; i++) {
        acc = fn(acc, walker.value, i);
        walker = walker.next;
      }
      return acc;
    };
    Yallist.prototype.reduceReverse = function(fn, initial) {
      var acc;
      var walker = this.tail;
      if (arguments.length > 1) {
        acc = initial;
      } else if (this.tail) {
        walker = this.tail.prev;
        acc = this.tail.value;
      } else {
        throw new TypeError("Reduce of empty list with no initial value");
      }
      for (var i = this.length - 1; walker !== null; i--) {
        acc = fn(acc, walker.value, i);
        walker = walker.prev;
      }
      return acc;
    };
    Yallist.prototype.toArray = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.head; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.next;
      }
      return arr;
    };
    Yallist.prototype.toArrayReverse = function() {
      var arr = new Array(this.length);
      for (var i = 0, walker = this.tail; walker !== null; i++) {
        arr[i] = walker.value;
        walker = walker.prev;
      }
      return arr;
    };
    Yallist.prototype.slice = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
        walker = walker.next;
      }
      for (; walker !== null && i < to; i++, walker = walker.next) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.sliceReverse = function(from, to) {
      to = to || this.length;
      if (to < 0) {
        to += this.length;
      }
      from = from || 0;
      if (from < 0) {
        from += this.length;
      }
      var ret = new Yallist();
      if (to < from || to < 0) {
        return ret;
      }
      if (from < 0) {
        from = 0;
      }
      if (to > this.length) {
        to = this.length;
      }
      for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
        walker = walker.prev;
      }
      for (; walker !== null && i > from; i--, walker = walker.prev) {
        ret.push(walker.value);
      }
      return ret;
    };
    Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
      if (start > this.length) {
        start = this.length - 1;
      }
      if (start < 0) {
        start = this.length + start;
      }
      for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
        walker = walker.next;
      }
      var ret = [];
      for (var i = 0; walker && i < deleteCount; i++) {
        ret.push(walker.value);
        walker = this.removeNode(walker);
      }
      if (walker === null) {
        walker = this.tail;
      }
      if (walker !== this.head && walker !== this.tail) {
        walker = walker.prev;
      }
      for (var i = 0; i < nodes.length; i++) {
        walker = insert(this, walker, nodes[i]);
      }
      return ret;
    };
    Yallist.prototype.reverse = function() {
      var head = this.head;
      var tail = this.tail;
      for (var walker = head; walker !== null; walker = walker.prev) {
        var p = walker.prev;
        walker.prev = walker.next;
        walker.next = p;
      }
      this.head = tail;
      this.tail = head;
      return this;
    };
    function insert(self2, node, value) {
      var inserted = node === self2.head ? new Node(value, null, node, self2) : new Node(value, node, node.next, self2);
      if (inserted.next === null) {
        self2.tail = inserted;
      }
      if (inserted.prev === null) {
        self2.head = inserted;
      }
      self2.length++;
      return inserted;
    }
    function push(self2, item) {
      self2.tail = new Node(item, self2.tail, null, self2);
      if (!self2.head) {
        self2.head = self2.tail;
      }
      self2.length++;
    }
    function unshift(self2, item) {
      self2.head = new Node(item, null, self2.head, self2);
      if (!self2.tail) {
        self2.tail = self2.head;
      }
      self2.length++;
    }
    function Node(value, prev, next, list) {
      if (!(this instanceof Node)) {
        return new Node(value, prev, next, list);
      }
      this.list = list;
      this.value = value;
      if (prev) {
        prev.next = this;
        this.prev = prev;
      } else {
        this.prev = null;
      }
      if (next) {
        next.prev = this;
        this.next = next;
      } else {
        this.next = null;
      }
    }
    try {
      require_iterator()(Yallist);
    } catch (er) {
    }
  }
});

// ../node_modules/.pnpm/lru-cache@6.0.0/node_modules/lru-cache/index.js
var require_lru_cache = __commonJS({
  "../node_modules/.pnpm/lru-cache@6.0.0/node_modules/lru-cache/index.js"(exports, module2) {
    "use strict";
    var Yallist = require_yallist();
    var MAX = Symbol("max");
    var LENGTH = Symbol("length");
    var LENGTH_CALCULATOR = Symbol("lengthCalculator");
    var ALLOW_STALE = Symbol("allowStale");
    var MAX_AGE = Symbol("maxAge");
    var DISPOSE = Symbol("dispose");
    var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
    var LRU_LIST = Symbol("lruList");
    var CACHE = Symbol("cache");
    var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
    var naiveLength = () => 1;
    var LRUCache = class {
      constructor(options) {
        if (typeof options === "number")
          options = { max: options };
        if (!options)
          options = {};
        if (options.max && (typeof options.max !== "number" || options.max < 0))
          throw new TypeError("max must be a non-negative number");
        const max = this[MAX] = options.max || Infinity;
        const lc = options.length || naiveLength;
        this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
        this[ALLOW_STALE] = options.stale || false;
        if (options.maxAge && typeof options.maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        this[MAX_AGE] = options.maxAge || 0;
        this[DISPOSE] = options.dispose;
        this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
        this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
        this.reset();
      }
      // resize the cache when the max changes.
      set max(mL) {
        if (typeof mL !== "number" || mL < 0)
          throw new TypeError("max must be a non-negative number");
        this[MAX] = mL || Infinity;
        trim(this);
      }
      get max() {
        return this[MAX];
      }
      set allowStale(allowStale) {
        this[ALLOW_STALE] = !!allowStale;
      }
      get allowStale() {
        return this[ALLOW_STALE];
      }
      set maxAge(mA) {
        if (typeof mA !== "number")
          throw new TypeError("maxAge must be a non-negative number");
        this[MAX_AGE] = mA;
        trim(this);
      }
      get maxAge() {
        return this[MAX_AGE];
      }
      // resize the cache when the lengthCalculator changes.
      set lengthCalculator(lC) {
        if (typeof lC !== "function")
          lC = naiveLength;
        if (lC !== this[LENGTH_CALCULATOR]) {
          this[LENGTH_CALCULATOR] = lC;
          this[LENGTH] = 0;
          this[LRU_LIST].forEach((hit) => {
            hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
            this[LENGTH] += hit.length;
          });
        }
        trim(this);
      }
      get lengthCalculator() {
        return this[LENGTH_CALCULATOR];
      }
      get length() {
        return this[LENGTH];
      }
      get itemCount() {
        return this[LRU_LIST].length;
      }
      rforEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].tail; walker !== null; ) {
          const prev = walker.prev;
          forEachStep(this, fn, walker, thisp);
          walker = prev;
        }
      }
      forEach(fn, thisp) {
        thisp = thisp || this;
        for (let walker = this[LRU_LIST].head; walker !== null; ) {
          const next = walker.next;
          forEachStep(this, fn, walker, thisp);
          walker = next;
        }
      }
      keys() {
        return this[LRU_LIST].toArray().map((k) => k.key);
      }
      values() {
        return this[LRU_LIST].toArray().map((k) => k.value);
      }
      reset() {
        if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
          this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
        }
        this[CACHE] = /* @__PURE__ */ new Map();
        this[LRU_LIST] = new Yallist();
        this[LENGTH] = 0;
      }
      dump() {
        return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter((h) => h);
      }
      dumpLru() {
        return this[LRU_LIST];
      }
      set(key, value, maxAge) {
        maxAge = maxAge || this[MAX_AGE];
        if (maxAge && typeof maxAge !== "number")
          throw new TypeError("maxAge must be a number");
        const now = maxAge ? Date.now() : 0;
        const len = this[LENGTH_CALCULATOR](value, key);
        if (this[CACHE].has(key)) {
          if (len > this[MAX]) {
            del(this, this[CACHE].get(key));
            return false;
          }
          const node = this[CACHE].get(key);
          const item = node.value;
          if (this[DISPOSE]) {
            if (!this[NO_DISPOSE_ON_SET])
              this[DISPOSE](key, item.value);
          }
          item.now = now;
          item.maxAge = maxAge;
          item.value = value;
          this[LENGTH] += len - item.length;
          item.length = len;
          this.get(key);
          trim(this);
          return true;
        }
        const hit = new Entry(key, value, len, now, maxAge);
        if (hit.length > this[MAX]) {
          if (this[DISPOSE])
            this[DISPOSE](key, value);
          return false;
        }
        this[LENGTH] += hit.length;
        this[LRU_LIST].unshift(hit);
        this[CACHE].set(key, this[LRU_LIST].head);
        trim(this);
        return true;
      }
      has(key) {
        if (!this[CACHE].has(key))
          return false;
        const hit = this[CACHE].get(key).value;
        return !isStale(this, hit);
      }
      get(key) {
        return get(this, key, true);
      }
      peek(key) {
        return get(this, key, false);
      }
      pop() {
        const node = this[LRU_LIST].tail;
        if (!node)
          return null;
        del(this, node);
        return node.value;
      }
      del(key) {
        del(this, this[CACHE].get(key));
      }
      load(arr) {
        this.reset();
        const now = Date.now();
        for (let l = arr.length - 1; l >= 0; l--) {
          const hit = arr[l];
          const expiresAt = hit.e || 0;
          if (expiresAt === 0)
            this.set(hit.k, hit.v);
          else {
            const maxAge = expiresAt - now;
            if (maxAge > 0) {
              this.set(hit.k, hit.v, maxAge);
            }
          }
        }
      }
      prune() {
        this[CACHE].forEach((value, key) => get(this, key, false));
      }
    };
    var get = (self2, key, doUse) => {
      const node = self2[CACHE].get(key);
      if (node) {
        const hit = node.value;
        if (isStale(self2, hit)) {
          del(self2, node);
          if (!self2[ALLOW_STALE])
            return void 0;
        } else {
          if (doUse) {
            if (self2[UPDATE_AGE_ON_GET])
              node.value.now = Date.now();
            self2[LRU_LIST].unshiftNode(node);
          }
        }
        return hit.value;
      }
    };
    var isStale = (self2, hit) => {
      if (!hit || !hit.maxAge && !self2[MAX_AGE])
        return false;
      const diff = Date.now() - hit.now;
      return hit.maxAge ? diff > hit.maxAge : self2[MAX_AGE] && diff > self2[MAX_AGE];
    };
    var trim = (self2) => {
      if (self2[LENGTH] > self2[MAX]) {
        for (let walker = self2[LRU_LIST].tail; self2[LENGTH] > self2[MAX] && walker !== null; ) {
          const prev = walker.prev;
          del(self2, walker);
          walker = prev;
        }
      }
    };
    var del = (self2, node) => {
      if (node) {
        const hit = node.value;
        if (self2[DISPOSE])
          self2[DISPOSE](hit.key, hit.value);
        self2[LENGTH] -= hit.length;
        self2[CACHE].delete(hit.key);
        self2[LRU_LIST].removeNode(node);
      }
    };
    var Entry = class {
      constructor(key, value, length, now, maxAge) {
        this.key = key;
        this.value = value;
        this.length = length;
        this.now = now;
        this.maxAge = maxAge || 0;
      }
    };
    var forEachStep = (self2, fn, node, thisp) => {
      let hit = node.value;
      if (isStale(self2, hit)) {
        del(self2, node);
        if (!self2[ALLOW_STALE])
          hit = void 0;
      }
      if (hit)
        fn.call(thisp, hit.value, hit.key, self2);
    };
    module2.exports = LRUCache;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/classes/range.js
var require_range = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/classes/range.js"(exports, module2) {
    var Range = class {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.format();
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().split(/\s+/).join(" ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.format();
      }
      format() {
        this.range = this.set.map((comps) => comps.join(" ").trim()).join("||").trim();
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range;
    var LRU = require_lru_cache();
    var cache = new LRU({ max: 1e3 });
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants3();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/classes/comparator.js"(exports, module2) {
    var ANY = Symbol("SemVer ANY");
    var Comparator = class {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range = require_range();
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/functions/satisfies.js"(exports, module2) {
    var Range = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/to-comparators.js"(exports, module2) {
    var Range = require_range();
    var toComparators = (range, options) => new Range(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module2.exports = toComparators;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/max-satisfying.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module2.exports = maxSatisfying;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/min-satisfying.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module2.exports = minSatisfying;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/min-version.js"(exports, module2) {
    var SemVer = require_semver();
    var Range = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module2.exports = minVersion;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/valid.js"(exports, module2) {
    var Range = require_range();
    var validRange = (range, options) => {
      try {
        return new Range(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module2.exports = validRange;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/outside.js"(exports, module2) {
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range = require_range();
    var satisfies = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module2.exports = outside;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/gtr.js"(exports, module2) {
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module2.exports = gtr;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/ltr.js"(exports, module2) {
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module2.exports = ltr;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/intersects.js"(exports, module2) {
    var Range = require_range();
    var intersects = (r1, r2, options) => {
      r1 = new Range(r1, options);
      r2 = new Range(r2, options);
      return r1.intersects(r2, options);
    };
    module2.exports = intersects;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/simplify.js"(exports, module2) {
    var satisfies = require_satisfies();
    var compare = require_compare();
    module2.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/ranges/subset.js"(exports, module2) {
    var Range = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range(sub, options);
      dom = new Range(dom, options);
      let sawNonNull = false;
      OUTER:
        for (const simpleSub of sub.set) {
          for (const simpleDom of dom.set) {
            const isSub = simpleSubset(simpleSub, simpleDom, options);
            sawNonNull = sawNonNull || isSub !== null;
            if (isSub) {
              continue OUTER;
            }
          }
          if (sawNonNull) {
            return false;
          }
        }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !satisfies(gt.semver, String(c), options)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !satisfies(lt.semver, String(c), options)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module2.exports = subset;
  }
});

// ../node_modules/.pnpm/semver@7.5.4/node_modules/semver/index.js
var require_semver2 = __commonJS({
  "../node_modules/.pnpm/semver@7.5.4/node_modules/semver/index.js"(exports, module2) {
    var internalRe = require_re();
    var constants = require_constants3();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var Comparator = require_comparator();
    var Range = require_range();
    var satisfies = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module2.exports = {
      parse,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      Comparator,
      Range,
      satisfies,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/aws_p.js
var require_aws_p = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/aws_p.js"(exports, module2) {
    "use strict";
    var semver = require_semver2();
    var Aws = require_aws();
    var contextUtils = require_context_utils();
    var Utils = require_utils3();
    var logger2 = require_logger();
    var minVersion = "2.7.15";
    var throttledErrorDefault = function throttledErrorDefault2() {
      return false;
    };
    var captureAWS = function captureAWS2(awssdk) {
      if (!semver.gte(awssdk.VERSION, minVersion)) {
        throw new Error("AWS SDK version " + minVersion + " or greater required.");
      }
      for (var prop in awssdk) {
        if (awssdk[prop].serviceIdentifier) {
          var Service = awssdk[prop];
          Service.prototype.customizeRequests(captureAWSRequest);
        }
      }
      return awssdk;
    };
    var captureAWSClient = function captureAWSClient2(service) {
      service.customizeRequests(captureAWSRequest);
      return service;
    };
    function captureAWSRequest(req) {
      var parent = contextUtils.resolveSegment(contextUtils.resolveManualSegmentParams(req.params));
      if (!parent) {
        var output = this.serviceIdentifier + "." + req.operation;
        if (!contextUtils.isAutomaticMode()) {
          logger2.getLogger().info("Call " + output + ' requires a segment object on the request params as "XRaySegment" for tracing in manual mode. Ignoring.');
        } else {
          logger2.getLogger().info("Call " + output + " is missing the sub/segment context for automatic mode. Ignoring.");
        }
        return req;
      }
      var throttledError = this.throttledError || throttledErrorDefault;
      var stack = new Error().stack;
      let subsegment;
      if (parent.notTraced) {
        subsegment = parent.addNewSubsegmentWithoutSampling(this.serviceIdentifier);
      } else {
        subsegment = parent.addNewSubsegment(this.serviceIdentifier);
      }
      var traceId = parent.segment ? parent.segment.trace_id : parent.trace_id;
      const data = parent.segment ? parent.segment.additionalTraceData : parent.additionalTraceData;
      var buildListener = function(req2) {
        let traceHeader = "Root=" + traceId + ";Parent=" + subsegment.id + ";Sampled=" + (subsegment.notTraced ? "0" : "1");
        if (data != null) {
          for (const [key, value] of Object.entries(data)) {
            traceHeader += ";" + key + "=" + value;
          }
        }
        req2.httpRequest.headers["X-Amzn-Trace-Id"] = traceHeader;
      };
      var completeListener = function(res) {
        subsegment.addAttribute("namespace", "aws");
        subsegment.addAttribute("aws", new Aws(res, subsegment.name));
        var httpRes = res.httpResponse;
        if (httpRes) {
          subsegment.addAttribute("http", new HttpResponse(httpRes));
          if (httpRes.statusCode === 429 || res.error && throttledError(res.error)) {
            subsegment.addThrottleFlag();
          }
        }
        if (res.error) {
          var err = { message: res.error.message, name: res.error.code, stack };
          if (httpRes && httpRes.statusCode) {
            if (Utils.getCauseTypeFromHttpStatus(httpRes.statusCode) == "error") {
              subsegment.addErrorFlag();
            }
            subsegment.close(err, true);
          } else {
            subsegment.close(err);
          }
        } else {
          if (httpRes && httpRes.statusCode) {
            var cause = Utils.getCauseTypeFromHttpStatus(httpRes.statusCode);
            if (cause) {
              subsegment[cause] = true;
            }
          }
          subsegment.close();
        }
      };
      req.on("beforePresign", function(req2) {
        parent.removeSubsegment(subsegment);
        parent.decrementCounter();
        req2.removeListener("build", buildListener);
        req2.removeListener("complete", completeListener);
      });
      req.on("build", buildListener).on("complete", completeListener);
      if (!req.__send) {
        req.__send = req.send;
        req.send = function(callback) {
          if (contextUtils.isAutomaticMode()) {
            var session = contextUtils.getNamespace();
            session.run(function() {
              contextUtils.setSegment(subsegment);
              req.__send(callback);
            });
          } else {
            req.__send(callback);
          }
        };
      }
    }
    function HttpResponse(res) {
      this.init(res);
    }
    HttpResponse.prototype.init = function init(res) {
      this.response = {
        status: res.statusCode || ""
      };
      if (res.headers && res.headers["content-length"]) {
        this.response.content_length = res.headers["content-length"];
      }
    };
    module2.exports.captureAWSClient = captureAWSClient;
    module2.exports.captureAWS = captureAWS;
  }
});

// ../node_modules/.pnpm/@smithy+service-error-classification@2.1.0/node_modules/@smithy/service-error-classification/dist-cjs/index.js
var require_dist_cjs = __commonJS({
  "../node_modules/.pnpm/@smithy+service-error-classification@2.1.0/node_modules/@smithy/service-error-classification/dist-cjs/index.js"(exports, module2) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export2(src_exports, {
      isClockSkewError: () => isClockSkewError,
      isRetryableByTrait: () => isRetryableByTrait,
      isServerError: () => isServerError,
      isThrottlingError: () => isThrottlingError,
      isTransientError: () => isTransientError
    });
    module2.exports = __toCommonJS2(src_exports);
    var CLOCK_SKEW_ERROR_CODES = [
      "AuthFailure",
      "InvalidSignatureException",
      "RequestExpired",
      "RequestInTheFuture",
      "RequestTimeTooSkewed",
      "SignatureDoesNotMatch"
    ];
    var THROTTLING_ERROR_CODES = [
      "BandwidthLimitExceeded",
      "EC2ThrottledException",
      "LimitExceededException",
      "PriorRequestNotComplete",
      "ProvisionedThroughputExceededException",
      "RequestLimitExceeded",
      "RequestThrottled",
      "RequestThrottledException",
      "SlowDown",
      "ThrottledException",
      "Throttling",
      "ThrottlingException",
      "TooManyRequestsException",
      "TransactionInProgressException"
      // DynamoDB
    ];
    var TRANSIENT_ERROR_CODES = ["TimeoutError", "RequestTimeout", "RequestTimeoutException"];
    var TRANSIENT_ERROR_STATUS_CODES = [500, 502, 503, 504];
    var NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "ECONNREFUSED", "EPIPE", "ETIMEDOUT"];
    var isRetryableByTrait = /* @__PURE__ */ __name((error) => error.$retryable !== void 0, "isRetryableByTrait");
    var isClockSkewError = /* @__PURE__ */ __name((error) => CLOCK_SKEW_ERROR_CODES.includes(error.name), "isClockSkewError");
    var isThrottlingError = /* @__PURE__ */ __name((error) => {
      var _a, _b;
      return ((_a = error.$metadata) == null ? void 0 : _a.httpStatusCode) === 429 || THROTTLING_ERROR_CODES.includes(error.name) || ((_b = error.$retryable) == null ? void 0 : _b.throttling) == true;
    }, "isThrottlingError");
    var isTransientError = /* @__PURE__ */ __name((error) => {
      var _a;
      return TRANSIENT_ERROR_CODES.includes(error.name) || NODEJS_TIMEOUT_ERROR_CODES.includes((error == null ? void 0 : error.code) || "") || TRANSIENT_ERROR_STATUS_CODES.includes(((_a = error.$metadata) == null ? void 0 : _a.httpStatusCode) || 0);
    }, "isTransientError");
    var isServerError = /* @__PURE__ */ __name((error) => {
      var _a;
      if (((_a = error.$metadata) == null ? void 0 : _a.httpStatusCode) !== void 0) {
        const statusCode = error.$metadata.httpStatusCode;
        if (500 <= statusCode && statusCode <= 599 && !isTransientError(error)) {
          return true;
        }
        return false;
      }
      return false;
    }, "isServerError");
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/aws3_p.js
var require_aws3_p = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/aws3_p.js"(exports) {
    "use strict";
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.captureAWSClient = void 0;
    var service_error_classification_1 = require_dist_cjs();
    var aws_1 = __importDefault(require_aws());
    var querystring_1 = require("querystring");
    var subsegment_1 = __importDefault(require_subsegment());
    var contextUtils = require_context_utils();
    var logger2 = require_logger();
    var { safeParseInt } = require_utils3();
    var utils_1 = require_utils3();
    var XRAY_PLUGIN_NAME = "XRaySDKInstrumentation";
    var buildAttributesFromMetadata = async (service, operation, region, commandInput, res, error) => {
      var _a, _b, _c;
      const { extendedRequestId, requestId, httpStatusCode: statusCode, attempts } = ((_a = res === null || res === void 0 ? void 0 : res.output) === null || _a === void 0 ? void 0 : _a.$metadata) || (error === null || error === void 0 ? void 0 : error.$metadata);
      const aws = new aws_1.default({
        extendedRequestId,
        requestId,
        retryCount: attempts,
        data: res === null || res === void 0 ? void 0 : res.output,
        request: {
          operation,
          params: commandInput,
          httpRequest: {
            region,
            statusCode
          }
        }
      }, service);
      const http = {};
      if (statusCode) {
        http.response = {};
        http.response.status = statusCode;
      }
      if (((_b = res === null || res === void 0 ? void 0 : res.response) === null || _b === void 0 ? void 0 : _b.headers) && ((_c = res === null || res === void 0 ? void 0 : res.response) === null || _c === void 0 ? void 0 : _c.headers["content-length"]) !== void 0) {
        if (!http.response) {
          http.response = {};
        }
        http.response.content_length = safeParseInt(res.response.headers["content-length"]);
      }
      return [aws, http];
    };
    function addFlags(http, subsegment, err) {
      var _a, _b, _c;
      if (err && (0, service_error_classification_1.isThrottlingError)(err)) {
        subsegment.addThrottleFlag();
      } else if (safeParseInt((_a = http.response) === null || _a === void 0 ? void 0 : _a.status) === 429 || safeParseInt((_b = err === null || err === void 0 ? void 0 : err.$metadata) === null || _b === void 0 ? void 0 : _b.httpStatusCode) === 429) {
        subsegment.addThrottleFlag();
      }
      const cause = (0, utils_1.getCauseTypeFromHttpStatus)(safeParseInt((_c = http.response) === null || _c === void 0 ? void 0 : _c.status));
      if (cause === "fault") {
        subsegment.addFaultFlag();
      } else if (cause === "error") {
        subsegment.addErrorFlag();
      }
    }
    var getXRayMiddleware = (config, manualSegment) => (next, context) => async (args) => {
      var _a;
      const segment = contextUtils.isAutomaticMode() ? contextUtils.resolveSegment() : manualSegment;
      const { clientName, commandName } = context;
      const commandInput = (_a = args === null || args === void 0 ? void 0 : args.input) !== null && _a !== void 0 ? _a : {};
      const commandOperation = commandName.slice(0, -7);
      const operation = commandOperation.charAt(0).toLowerCase() + commandOperation.slice(1);
      const service = clientName.slice(0, -6);
      if (!segment) {
        const output = service + "." + operation;
        if (!contextUtils.isAutomaticMode()) {
          logger2.getLogger().info("Call " + output + " requires a segment object passed to captureAWSv3Client for tracing in manual mode. Ignoring.");
        } else {
          logger2.getLogger().info("Call " + output + " is missing the sub/segment context for automatic mode. Ignoring.");
        }
        return next(args);
      }
      let subsegment;
      if (segment.notTraced) {
        subsegment = segment.addNewSubsegmentWithoutSampling(service);
      } else {
        subsegment = segment.addNewSubsegment(service);
      }
      subsegment.addAttribute("namespace", "aws");
      const parent = segment instanceof subsegment_1.default ? segment.segment : segment;
      const data = parent.segment ? parent.segment.additionalTraceData : parent.additionalTraceData;
      let traceHeader = (0, querystring_1.stringify)({
        Root: parent.trace_id,
        Parent: subsegment.id,
        Sampled: subsegment.notTraced ? "0" : "1"
      }, ";");
      if (data != null) {
        for (const [key, value] of Object.entries(data)) {
          traceHeader += ";" + key + "=" + value;
        }
      }
      args.request.headers["X-Amzn-Trace-Id"] = traceHeader;
      let res;
      try {
        res = await next(args);
        if (!res) {
          throw new Error("Failed to get response from instrumented AWS Client.");
        }
        const [aws, http] = await buildAttributesFromMetadata(service, operation, await config.region(), commandInput, res, null);
        subsegment.addAttribute("aws", aws);
        subsegment.addAttribute("http", http);
        addFlags(http, subsegment);
        subsegment.close();
        return res;
      } catch (err) {
        if (err.$metadata) {
          const [aws, http] = await buildAttributesFromMetadata(service, operation, await config.region(), commandInput, null, err);
          subsegment.addAttribute("aws", aws);
          subsegment.addAttribute("http", http);
          addFlags(http, subsegment, err);
        }
        const errObj = { message: err.message, name: err.name, stack: err.stack || new Error().stack };
        subsegment.close(errObj, true);
        throw err;
      }
    };
    var xRayMiddlewareOptions = {
      name: XRAY_PLUGIN_NAME,
      step: "build"
    };
    var getXRayPlugin = (config, manualSegment) => ({
      applyToStack: (stack) => {
        stack.add(getXRayMiddleware(config, manualSegment), xRayMiddlewareOptions);
      }
    });
    function captureAWSClient(client, manualSegment) {
      client.middlewareStack.remove(XRAY_PLUGIN_NAME);
      client.middlewareStack.use(getXRayPlugin(client.config, manualSegment));
      return client;
    }
    exports.captureAWSClient = captureAWSClient;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/http_p.js
var require_http_p = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/http_p.js"(exports, module2) {
    "use strict";
    var url = require("url");
    var contextUtils = require_context_utils();
    var Utils = require_utils3();
    var logger2 = require_logger();
    var events = require("events");
    var captureHTTPsGlobal = function captureHTTPsGlobal2(module3, downstreamXRayEnabled, subsegmentCallback) {
      if (!module3.__request) {
        enableCapture(module3, downstreamXRayEnabled, subsegmentCallback);
      }
    };
    var captureHTTPs = function captureHTTPs2(module3, downstreamXRayEnabled, subsegmentCallback) {
      if (module3.__request) {
        return module3;
      }
      var tracedModule = {};
      Object.keys(module3).forEach(function(val) {
        tracedModule[val] = module3[val];
      });
      enableCapture(tracedModule, downstreamXRayEnabled, subsegmentCallback);
      return tracedModule;
    };
    function enableCapture(module3, downstreamXRayEnabled, subsegmentCallback) {
      function captureOutgoingHTTPs(baseFunc, ...args) {
        let options;
        let callback;
        let hasUrl;
        let urlObj;
        let arg0 = args[0];
        if (typeof args[1] === "object") {
          hasUrl = true;
          urlObj = typeof arg0 === "string" ? new url.URL(arg0) : arg0;
          options = args[1], callback = args[2];
        } else {
          hasUrl = false;
          options = arg0;
          callback = args[1];
        }
        if (!options || options.headers && options.headers["X-Amzn-Trace-Id"]) {
          return baseFunc(...args);
        }
        if (typeof options === "string") {
          options = new url.URL(options);
        }
        if (!hasUrl) {
          urlObj = options;
        }
        const parent = contextUtils.resolveSegment(contextUtils.resolveManualSegmentParams(options));
        const hostname = options.hostname || options.host || urlObj.hostname || urlObj.host || "Unknown host";
        if (!parent) {
          let output = "[ host: " + hostname;
          output = options.method ? output + ", method: " + options.method : output;
          output += ", path: " + (urlObj.pathname || Utils.stripQueryStringFromPath(options.path)) + " ]";
          if (!contextUtils.isAutomaticMode()) {
            logger2.getLogger().info("Options for request " + output + ' requires a segment object on the options params as "XRaySegment" for tracing in manual mode. Ignoring.');
          } else {
            logger2.getLogger().info("Options for request " + output + " is missing the sub/segment context for automatic mode. Ignoring.");
          }
          return baseFunc(...args);
        }
        let subsegment;
        if (parent.notTraced) {
          subsegment = parent.addNewSubsegmentWithoutSampling(hostname);
        } else {
          subsegment = parent.addNewSubsegment(hostname);
        }
        const root = parent.segment ? parent.segment : parent;
        subsegment.namespace = "remote";
        if (!options.headers) {
          options.headers = {};
        }
        options.headers["X-Amzn-Trace-Id"] = "Root=" + root.trace_id + ";Parent=" + subsegment.id + ";Sampled=" + (subsegment.notTraced ? "0" : "1");
        const errorCapturer = function errorCapturer2(e) {
          if (subsegmentCallback) {
            subsegmentCallback(subsegment, this, null, e);
          }
          if (subsegment.http && subsegment.http.response) {
            if (Utils.getCauseTypeFromHttpStatus(subsegment.http.response.status) === "error") {
              subsegment.addErrorFlag();
            }
            subsegment.close(e, true);
          } else {
            const madeItToDownstream = e.code !== "ECONNREFUSED";
            subsegment.addRemoteRequestData(this, null, madeItToDownstream && downstreamXRayEnabled);
            subsegment.close(e);
          }
        };
        const optionsCopy = Utils.objectWithoutProperties(options, ["Segment"], true);
        let req = baseFunc(...hasUrl ? [arg0, optionsCopy] : [options], function(res) {
          res.on("end", function() {
            if (subsegmentCallback) {
              subsegmentCallback(subsegment, this.req, res);
            }
            if (res.statusCode === 429) {
              subsegment.addThrottleFlag();
            }
            const cause = Utils.getCauseTypeFromHttpStatus(res.statusCode);
            if (cause) {
              subsegment[cause] = true;
            }
            subsegment.addRemoteRequestData(res.req, res, !!downstreamXRayEnabled);
            subsegment.close();
          });
          if (typeof callback === "function") {
            if (contextUtils.isAutomaticMode()) {
              const session = contextUtils.getNamespace();
              session.run(function() {
                contextUtils.setSegment(subsegment);
                callback(res);
              });
            } else {
              callback(res);
            }
          } else if (res.req && res.req.listenerCount("response") === 0) {
            res.resume();
          }
        });
        req.on(events.errorMonitor || "error", errorCapturer);
        return req;
      }
      module3.__request = module3.request;
      function captureHTTPsRequest(...args) {
        return captureOutgoingHTTPs(module3.__request, ...args);
      }
      module3.__get = module3.get;
      function captureHTTPsGet(...args) {
        return captureOutgoingHTTPs(module3.__get, ...args);
      }
      Object.defineProperties(module3, {
        request: { value: captureHTTPsRequest, configurable: true, enumerable: true, writable: true },
        get: { value: captureHTTPsGet, configurable: true, enumerable: true, writable: true }
      });
    }
    module2.exports.captureHTTPsGlobal = captureHTTPsGlobal;
    module2.exports.captureHTTPs = captureHTTPs;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/promise_p.js
var require_promise_p = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/patchers/promise_p.js"(exports, module2) {
    "use strict";
    var contextUtils = require_context_utils();
    var originalThen = Symbol("original then");
    var originalCatch = Symbol("original catch");
    function patchPromise(Promise2) {
      const then = Promise2.prototype.then;
      if (!then[originalThen]) {
        Promise2.prototype.then = function(onFulfilled, onRejected) {
          if (contextUtils.isAutomaticMode() && tryGetCurrentSegment()) {
            const ns = contextUtils.getNamespace();
            onFulfilled = onFulfilled && ns.bind(onFulfilled);
            onRejected = onRejected && ns.bind(onRejected);
          }
          return then.call(this, onFulfilled, onRejected);
        };
        Promise2.prototype.then[originalThen] = then;
      }
      const origCatch = Promise2.prototype.catch;
      if (origCatch && !origCatch[originalCatch]) {
        Promise2.prototype.catch = function(onRejected) {
          if (contextUtils.isAutomaticMode() && tryGetCurrentSegment()) {
            const ns = contextUtils.getNamespace();
            onRejected = onRejected && ns.bind(onRejected);
          }
          return origCatch.call(this, onRejected);
        };
        Promise2.prototype.catch[originalCatch] = origCatch;
      }
    }
    function unpatchPromise(Promise2) {
      const then = Promise2.prototype.then;
      if (then[originalThen]) {
        Promise2.prototype.then = then[originalThen];
      }
      const origCatch = Promise2.prototype.catch;
      if (origCatch && origCatch[originalCatch]) {
        Promise2.prototype.catch = origCatch[originalCatch];
      }
    }
    function tryGetCurrentSegment() {
      try {
        return contextUtils.getSegment();
      } catch (e) {
        return void 0;
      }
    }
    function capturePromise() {
      patchPromise(Promise);
    }
    function uncapturePromise() {
      unpatchPromise(Promise);
    }
    capturePromise.patchThirdPartyPromise = patchPromise;
    module2.exports.capturePromise = capturePromise;
    module2.exports.uncapturePromise = uncapturePromise;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/database/sql_data.js
var require_sql_data = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/database/sql_data.js"(exports, module2) {
    "use strict";
    function SqlData(databaseVer, driverVer, user, url, queryType) {
      this.init(databaseVer, driverVer, user, url, queryType);
    }
    SqlData.prototype.init = function init(databaseVer, driverVer, user, url, queryType) {
      if (databaseVer) {
        this.database_version = databaseVer;
      }
      if (driverVer) {
        this.driver_version = driverVer;
      }
      if (queryType) {
        this.preparation = queryType;
      }
      this.url = url;
      this.user = user;
    };
    module2.exports = SqlData;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/aws-xray.js
var require_aws_xray = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/aws-xray.js"(exports, module2) {
    "use strict";
    var contextUtils = require_context_utils();
    var logging = require_logger();
    var segmentUtils = require_segment_utils();
    var utils = require_utils3();
    var LambdaEnv = require_aws_lambda();
    var pkginfo = {};
    try {
      pkginfo = require_package();
    } catch (err) {
      logging.getLogger().debug("Failed to load SDK data:", err);
    }
    var UNKNOWN = "unknown";
    var AWSXRay = {
      /**
       * @memberof AWSXRay
       * @type {object}
       * @namespace AWSXRay.plugins
       */
      plugins: {
        /**
         * Exposes the AWS EC2 plugin.
         * @memberof AWSXRay.plugins
         */
        EC2Plugin: require_ec2_plugin(),
        /**
         * Exposes the AWS ECS plugin.
         * @memberof AWSXRay.plugins
         */
        ECSPlugin: require_ecs_plugin(),
        /**
         * Exposes the AWS Elastic Beanstalk plugin.
         * @memberof AWSXRay.plugins
         */
        ElasticBeanstalkPlugin: require_elastic_beanstalk_plugin()
      },
      /**
       * Enables use of plugins to capture additional data for segments.
       * @param {Array} plugins - A configurable subset of AWSXRay.plugins.
       * @memberof AWSXRay
       * @see AWSXRay.plugins
       */
      config: function(plugins) {
        var pluginData = {};
        plugins.forEach(function(plugin) {
          plugin.getData(function(data) {
            if (data) {
              for (var attribute in data) {
                pluginData[attribute] = data[attribute];
              }
            }
          });
          segmentUtils.setOrigin(plugin.originName);
          segmentUtils.setPluginData(pluginData);
        });
      },
      /**
       * Overrides the default whitelisting file to specify what params to capture on each AWS Service call.
       * If a service or API is not listed, no additional data is captured.
       * The base whitelisting file can be found at /lib/resources/aws_whitelist.json
       * @param {string|Object} source - The path to the custom whitelist file, or a whitelist source JSON object.
       * @memberof AWSXRay
       */
      setAWSWhitelist: require_aws().setAWSWhitelist,
      /**
       * Appends to the current whitelisting file.
       * In the case of a duplicate service API listed, the new source will override the previous values.
       * @param {string|Object} source - The path to the custom whitelist file, or a whitelist source JSON object.
       * @memberof AWSXRay
       */
      appendAWSWhitelist: require_aws().appendAWSWhitelist,
      /**
       * Overrides the default streaming threshold (100).
       * The threshold represents the maximum number of subsegments on a single segment before
       * the SDK begins to send the completed subsegments out of band of the main segment.
       * Reduce this threshold if you see the 'Segment too large to send' error.
       * @param {number} threshold - The new threshold to use.
       * @memberof AWSXRay
       */
      setStreamingThreshold: segmentUtils.setStreamingThreshold,
      /**
       * Set your own logger for the SDK.
       * @param {Object} logger - A logger which responds to debug/info/warn/error calls.
       * @memberof AWSXRay
       */
      setLogger: logging.setLogger,
      /**
       * Gets the set logger for the SDK.
       * @memberof AWSXRay
       */
      getLogger: logging.getLogger,
      /**
       * Configures the address and port the daemon is expected to be on.
       * @param {string} address - Address of the daemon the segments should be sent to.  Expects 'x.x.x.x', ':yyyy' or 'x.x.x.x:yyyy' IPv4 formats.
       * @module DaemonConfig
       * @memberof AWSXRay
       * @function
       * @see module:DaemonConfig.setDaemonAddress
       */
      setDaemonAddress: require_daemon_config().setDaemonAddress,
      /**
       * @param {string} name - The name of the new subsegment.
       * @param {function} fcn - The function conext to wrap.
       * @param {Segment|Subsegment} [parent] - The parent for the new subsegment, for manual mode.
       * @memberof AWSXRay
       * @function
       * @see module:capture.captureFunc
       */
      captureFunc: require_capture().captureFunc,
      /**
       * @param {string} name - The name of the new subsegment.
       * @param {function} fcn - The function conext to wrap.
       * @param {Segment|Subsegment} [parent] - The parent for the new subsegment, for manual mode.
       * @memberof AWSXRay
       * @function
       * @see module:capture.captureAsyncFunc
       */
      captureAsyncFunc: require_capture().captureAsyncFunc,
      /**
       * @param {string} name - The name of the new subsegment.
       * @param {function} fcn - The function conext to wrap.
       * @param {Segment|Subsegment} [parent] - The parent for the new subsegment, for manual mode.
       * @memberof AWSXRay
       * @function
       * @see module:capture.captureCallbackFunc
       */
      captureCallbackFunc: require_capture().captureCallbackFunc,
      /**
       * @param {AWS} awssdk - The Javascript AWS SDK.
       * @memberof AWSXRay
       * @function
       * @see module:aws_p.captureAWS
       */
      captureAWS: require_aws_p().captureAWS,
      /**
       * @param {AWS.Service} service - An instance of a AWS service to wrap.
       * @memberof AWSXRay
       * @function
       * @see module:aws_p.captureAWSClient
       */
      captureAWSClient: require_aws_p().captureAWSClient,
      /**
       * @param {AWSv3.Service} service - An instance of a AWS SDK v3 service to wrap.
       * @param {Segment|Subsegment} segment - Optional segment for manual mode.
       * @memberof AWSXRay
       * @function
       * @see module:aws3_p.captureAWSClient
       */
      captureAWSv3Client: require_aws3_p().captureAWSClient,
      /**
       * @param {http|https} module - The built in Node.js HTTP or HTTPS module.
       * @memberof AWSXRay
       * @function
       * @returns {http|https}
       * @see module:http_p.captureHTTPs
       */
      captureHTTPs: require_http_p().captureHTTPs,
      /**
       * @param {http|https} module - The built in Node.js HTTP or HTTPS module.
       * @memberof AWSXRay
       * @function
       * @see module:http_p.captureHTTPsGlobal
       */
      captureHTTPsGlobal: require_http_p().captureHTTPsGlobal,
      /**
       * @memberof AWSXRay
       * @function
       * @see module:promise_p.capturePromise
       */
      capturePromise: require_promise_p().capturePromise,
      /**
       * Exposes various helper methods.
       * @memberof AWSXRay
       * @function
       * @see module:utils
       */
      utils,
      /**
       * @memberof AWSXRay
       * @type {object}
       * @namespace AWSXRay.database
       */
      database: {
        /**
         * Exposes the SqlData class.
         * @memberof AWSXRay.database
         * @see SqlData
         */
        SqlData: require_sql_data()
      },
      /**
       * Exposes the Middleware Utils class.
       * @memberof AWSXRay
       * @function
       * @see module:mw_utils
       */
      middleware: require_mw_utils(),
      /**
       * Gets the current namespace of the context.
       * Used for supporting functions that can be used in automatic mode.
       * @memberof AWSXRay
       * @function
       * @returns {Segment|Subsegment}
       * @see module:context_utils.getNamespace
       */
      getNamespace: contextUtils.getNamespace,
      /**
       * Resolves the current segment or subsegment, checks manual and automatic modes.
       * Used for supporting functions that can be used in both manual and automatic modes.
       * @memberof AWSXRay
       * @function
       * @returns {Segment|Subsegment}
       * @see module:context_utils.resolveSegment
       */
      resolveSegment: contextUtils.resolveSegment,
      /**
       * Returns the current segment or subsegment. For use with automatic mode only.
       * @memberof AWSXRay
       * @function
       * @returns {Segment|Subsegment}
       * @see module:context_utils.getSegment
       */
      getSegment: contextUtils.getSegment,
      /**
       * Sets the current segment or subsegment.  For use with automatic mode only.
       * @memberof AWSXRay
       * @function
       * @see module:context_utils.setSegment
       */
      setSegment: contextUtils.setSegment,
      /**
       * Returns true if automatic mode is enabled, otherwise false.
       * @memberof AWSXRay
       * @function
       * @see module:context_utils.isAutomaticMode
       */
      isAutomaticMode: contextUtils.isAutomaticMode,
      /**
       * Enables automatic mode. Automatic mode uses 'cls-hooked'.
       * @see https://github.com/jeff-lewis/cls-hooked
       * @memberof AWSXRay
       * @function
       * @see module:context_utils.enableAutomaticMode
       */
      enableAutomaticMode: contextUtils.enableAutomaticMode,
      /**
       * Disables automatic mode. Current segment or subsegment must be passed manually
       * via the parent optional on captureFunc, captureAsyncFunc etc.
       * @memberof AWSXRay
       * @function
       * @see module:context_utils.enableManualMode
       */
      enableManualMode: contextUtils.enableManualMode,
      /**
       * Sets the context missing strategy.
       * @param {Object} strategy - The strategy to set. This object's contextMissing function will be called whenever trace context is not found.
       */
      setContextMissingStrategy: contextUtils.setContextMissingStrategy,
      /**
       * Exposes the segment class.
       * @memberof AWSXRay
       * @function
       */
      Segment: require_segment(),
      /**
       * Exposes the subsegment class.
       * @memberof AWSXRay
       * @see Subsegment
       */
      Subsegment: require_subsegment(),
      SegmentUtils: segmentUtils
    };
    AWSXRay.middleware.IncomingRequestData = require_incoming_request_data(), function() {
      var data = {
        runtime: process.release && process.release.name ? process.release.name : UNKNOWN,
        runtime_version: process.version,
        version: process.env.npm_package_version || UNKNOWN,
        name: process.env.npm_package_name || UNKNOWN
      };
      var sdkData = {
        sdk: "X-Ray for Node.js",
        sdk_version: pkginfo.version ? pkginfo.version : UNKNOWN,
        package: pkginfo.name ? pkginfo.name : UNKNOWN
      };
      segmentUtils.setSDKData(sdkData);
      segmentUtils.setServiceData(data);
      if (process.env.LAMBDA_TASK_ROOT) {
        LambdaEnv.init();
      }
    }();
    module2.exports = AWSXRay;
  }
});

// ../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/index.js
var require_lib4 = __commonJS({
  "../node_modules/.pnpm/aws-xray-sdk-core@3.5.3/node_modules/aws-xray-sdk-core/dist/lib/index.js"(exports, module2) {
    "use strict";
    module2.exports = require_aws_xray();
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/provider/ProviderService.js
var require_ProviderService = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/provider/ProviderService.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProviderService = void 0;
    var aws_xray_sdk_core_1 = require_lib4();
    var commons_1 = require_lib();
    var ProviderService = class {
      captureAWS(awssdk) {
        return (0, aws_xray_sdk_core_1.captureAWS)(awssdk);
      }
      captureAWSClient(service) {
        return (0, aws_xray_sdk_core_1.captureAWSClient)(service);
      }
      captureAWSv3Client(service) {
        (0, commons_1.addUserAgentMiddleware)(service, "tracer");
        return (0, aws_xray_sdk_core_1.captureAWSv3Client)(service);
      }
      captureAsyncFunc(name, fcn, _parent) {
        return (0, aws_xray_sdk_core_1.captureAsyncFunc)(name, fcn);
      }
      captureFunc(name, fcn, _parent) {
        return (0, aws_xray_sdk_core_1.captureFunc)(name, fcn);
      }
      captureHTTPsGlobal() {
        (0, aws_xray_sdk_core_1.captureHTTPsGlobal)(require("http"));
        (0, aws_xray_sdk_core_1.captureHTTPsGlobal)(require("https"));
      }
      getNamespace() {
        return (0, aws_xray_sdk_core_1.getNamespace)();
      }
      getSegment() {
        return (0, aws_xray_sdk_core_1.getSegment)();
      }
      putAnnotation(key, value) {
        const segment = this.getSegment();
        if (segment === void 0) {
          console.warn("No active segment or subsegment found, skipping annotation");
          return;
        }
        if (segment instanceof aws_xray_sdk_core_1.Segment) {
          console.warn("You cannot annotate the main segment in a Lambda execution environment");
          return;
        }
        segment.addAnnotation(key, value);
      }
      putMetadata(key, value, namespace) {
        const segment = this.getSegment();
        if (segment === void 0) {
          console.warn("No active segment or subsegment found, skipping metadata addition");
          return;
        }
        if (segment instanceof aws_xray_sdk_core_1.Segment) {
          console.warn("You cannot add metadata to the main segment in a Lambda execution environment");
          return;
        }
        segment.addMetadata(key, value, namespace);
      }
      setContextMissingStrategy(strategy) {
        (0, aws_xray_sdk_core_1.setContextMissingStrategy)(strategy);
      }
      setDaemonAddress(address) {
        (0, aws_xray_sdk_core_1.setDaemonAddress)(address);
      }
      setLogger(logObj) {
        (0, aws_xray_sdk_core_1.setLogger)(logObj);
      }
      setSegment(segment) {
        (0, aws_xray_sdk_core_1.setSegment)(segment);
      }
    };
    exports.ProviderService = ProviderService;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/provider/ProviderServiceInterface.js
var require_ProviderServiceInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/provider/ProviderServiceInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/provider/index.js
var require_provider = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/provider/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_ProviderService(), exports);
    __exportStar(require_ProviderServiceInterface(), exports);
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/Tracer.js
var require_Tracer = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/Tracer.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tracer = void 0;
    var commons_1 = require_lib();
    var config_1 = require_config4();
    var provider_1 = require_provider();
    var aws_xray_sdk_core_1 = require_lib4();
    var Tracer2 = class extends commons_1.Utility {
      constructor(options = {}) {
        super();
        this.captureError = true;
        this.captureHTTPsRequests = true;
        this.captureResponse = true;
        this.tracingEnabled = true;
        this.setOptions(options);
        this.provider = new provider_1.ProviderService();
        if (this.isTracingEnabled() && this.captureHTTPsRequests) {
          this.provider.captureHTTPsGlobal();
        }
        if (!this.isTracingEnabled()) {
          this.provider.setContextMissingStrategy(() => ({}));
        }
      }
      /**
       * Add an error to the current segment or subsegment as metadata.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-errors
       *
       * @param error - Error to serialize as metadata
       * @param [remote] - Whether the error was thrown by a remote service. Defaults to `false`
       */
      addErrorAsMetadata(error, remote) {
        if (!this.isTracingEnabled()) {
          return;
        }
        const subsegment = this.getSegment();
        if (subsegment === void 0) {
          return;
        }
        if (!this.captureError) {
          subsegment.addErrorFlag();
          return;
        }
        subsegment.addError(error, remote || false);
      }
      /**
       * Add response data to the current segment or subsegment as metadata.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-annotations
       *
       * @param data - Data to serialize as metadata
       * @param methodName - Name of the method that is being traced
       */
      addResponseAsMetadata(data, methodName) {
        if (data === void 0 || !this.captureResponse || !this.isTracingEnabled()) {
          return;
        }
        this.putMetadata(`${methodName} response`, data);
      }
      /**
       * Add service name to the current segment or subsegment as annotation.
       *
       */
      addServiceNameAnnotation() {
        if (!this.isTracingEnabled()) {
          return;
        }
        this.putAnnotation("Service", this.serviceName);
      }
      /**
       * Add ColdStart annotation to the current segment or subsegment.
       *
       * If Tracer has been initialized outside the Lambda handler then the same instance
       * of Tracer will be reused throughout the lifecycle of that same Lambda execution environment
       * and this method will annotate `ColdStart: false` after the first invocation.
       *
       * @see https://docs.aws.amazon.com/lambda/latest/dg/runtimes-context.html
       */
      annotateColdStart() {
        if (this.isTracingEnabled()) {
          this.putAnnotation("ColdStart", this.getColdStart());
        }
      }
      /**
       * Patch all AWS SDK v2 clients and create traces when your application makes calls to AWS services.
       *
       * If you want to patch a specific client use {@link captureAWSClient} and if you are using AWS SDK v3 use {@link captureAWSv3Client} instead.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-awssdkclients.html
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       * const AWS = tracer.captureAWS(require('aws-sdk'));
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   ...
       * }
       * ```
       *
       * @param aws - AWS SDK v2 import
       * @returns AWS - Instrumented AWS SDK
       */
      captureAWS(aws) {
        if (!this.isTracingEnabled())
          return aws;
        return this.provider.captureAWS(aws);
      }
      /**
       * Patch a specific AWS SDK v2 client and create traces when your application makes calls to that AWS service.
       *
       * If you want to patch all clients use {@link captureAWS} and if you are using AWS SDK v3 use {@link captureAWSv3Client} instead.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-awssdkclients.html
       *
       * @example
       * ```typescript
       * import { S3 } from 'aws-sdk';
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       * const s3 = tracer.captureAWSClient(new S3({ apiVersion: '2006-03-01' }));
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   ...
       * }
       * ```
       *
       * @param service - AWS SDK v2 client
       * @returns service - Instrumented AWS SDK v2 client
       */
      captureAWSClient(service) {
        if (!this.isTracingEnabled())
          return service;
        try {
          return this.provider.captureAWSClient(service);
        } catch (error) {
          try {
            this.provider.captureAWSClient(service.service);
            return service;
          } catch {
            throw error;
          }
        }
      }
      /**
       * Patch an AWS SDK v3 client and create traces when your application makes calls to that AWS service.
       *
       * If you are using AWS SDK v2 use {@link captureAWSClient} instead.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-awssdkclients.html
       *
       * @example
       * ```typescript
       * import { S3Client } from '@aws-sdk/client-s3';
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       * const client = new S3Client({});
       * tracer.captureAWSv3Client(client);
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   ...
       * }
       * ```
       *
       * @param service - AWS SDK v3 client
       * @returns service - Instrumented AWS SDK v3 client
       */
      captureAWSv3Client(service) {
        if (!this.isTracingEnabled())
          return service;
        return this.provider.captureAWSv3Client(service);
      }
      /**
       * A decorator automating capture of metadata and annotations on segments or subsegments for a Lambda Handler.
       *
       * Using this decorator on your handler function will automatically:
       * * handle the subsegment lifecycle
       * * add the `ColdStart` annotation
       * * add the function response as metadata
       * * add the function error as metadata (if any)
       *
       * Note: Currently TypeScript only supports decorators on classes and methods. If you are using the
       * function syntax, you should use the middleware instead.
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       * import { LambdaInterface } from '@aws-lambda-powertools/commons';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * class Lambda implements LambdaInterface {
       *   ⁣@tracer.captureLambdaHandler()
       *   public handler(_event: unknown, _context: unknown) {
       *     // ...
       *   }
       * }
       *
       * const handlerClass = new Lambda();
       * export const handler = handlerClass.handler.bind(handlerClass);
       * ```
       *
       * @decorator Class
       * @param options - (_optional_) Options for the decorator
       */
      captureLambdaHandler(options) {
        return (_target, _propertyKey, descriptor) => {
          const originalMethod = descriptor.value;
          const tracerRef = this;
          descriptor.value = function(event, context, callback) {
            const handlerRef = this;
            if (!tracerRef.isTracingEnabled()) {
              return originalMethod.apply(handlerRef, [event, context, callback]);
            }
            return tracerRef.provider.captureAsyncFunc(`## ${process.env._HANDLER}`, async (subsegment) => {
              tracerRef.annotateColdStart();
              tracerRef.addServiceNameAnnotation();
              let result;
              try {
                result = await originalMethod.apply(handlerRef, [
                  event,
                  context,
                  callback
                ]);
                if (options?.captureResponse ?? true) {
                  tracerRef.addResponseAsMetadata(result, process.env._HANDLER);
                }
              } catch (error) {
                tracerRef.addErrorAsMetadata(error);
                throw error;
              } finally {
                try {
                  subsegment?.close();
                } catch (error) {
                  console.warn(`Failed to close or serialize segment %s. We are catching the error but data might be lost.`, subsegment?.name, error);
                }
              }
              return result;
            });
          };
          return descriptor;
        };
      }
      /**
       * A decorator automating capture of metadata and annotations on segments or subsegments for an arbitrary function.
       *
       * Using this decorator on your function will automatically:
       * * handle the subsegment lifecycle
       * * add the function response as metadata
       * * add the function error as metadata (if any)
       *
       * Note: Currently TypeScript only supports decorators on classes and methods. If you are using the
       * function syntax, you should use the middleware instead.
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       * import { LambdaInterface } from '@aws-lambda-powertools/commons';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * class Lambda implements LambdaInterface {
       *   ⁣@tracer.captureMethod()
       *   public myMethod(param: string) {
       *     // ...
       *   }
       *
       *   public handler(_event: unknown, _context: unknown) {
       *     this.myMethod('foo');
       *   }
       * }
       *
       * const handlerClass = new Lambda();
       * export const handler = handlerClass.handler.bind(handlerClass);;
       * ```
       *
       * @decorator Class
       * @param options - (_optional_) Options for the decorator
       */
      captureMethod(options) {
        return (_target, propertyKey, descriptor) => {
          const originalMethod = descriptor.value;
          const tracerRef = this;
          descriptor.value = function(...args) {
            if (!tracerRef.isTracingEnabled()) {
              return originalMethod.apply(this, [...args]);
            }
            const methodName = String(propertyKey);
            const subsegmentName = options?.subSegmentName ? options.subSegmentName : `### ${methodName}`;
            return tracerRef.provider.captureAsyncFunc(subsegmentName, async (subsegment) => {
              let result;
              try {
                result = await originalMethod.apply(this, [...args]);
                if (options?.captureResponse ?? true) {
                  tracerRef.addResponseAsMetadata(result, methodName);
                }
              } catch (error) {
                tracerRef.addErrorAsMetadata(error);
                throw error;
              } finally {
                try {
                  subsegment?.close();
                } catch (error) {
                  console.warn(`Failed to close or serialize segment %s. We are catching the error but data might be lost.`, subsegment?.name, error);
                }
              }
              return result;
            });
          };
          return descriptor;
        };
      }
      /**
       * Get the current root AWS X-Ray trace id.
       *
       * Utility method that returns the current AWS X-Ray Root trace id. Useful as correlation id for downstream processes.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * export const handler = async () => {
       *   try {
       *     ...
       *   } catch (err) {
       *     const rootTraceId = tracer.getRootXrayTraceId();
       *
       *     // Example of returning an error response
       *     return {
       *       statusCode: 500,
       *       // Include the rootTraceId in the response so we can show a "contact support" button that
       *       // takes the customer to a customer service form with the trace as additional context.
       *       body: `Internal Error - Please contact support and quote the following id: ${rootTraceId}`,
       *       headers: { '_X_AMZN_TRACE_ID': rootTraceId },
       *     };
       *   }
       * }
       * ```
       *
       * @returns string - The root X-Ray trace id.
       */
      getRootXrayTraceId() {
        return this.envVarsService.getXrayTraceId();
      }
      /**
       * Get the active segment or subsegment (if any) in the current scope.
       *
       * Usually you won't need to call this method unless you are creating custom subsegments or using manual mode.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-segments
       * @see https://docs.powertools.aws.dev/lambda/typescript/latest/core/tracer/#escape-hatch-mechanism
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   const currentSegment = tracer.getSegment();
       *   ... // Do something with segment
       * }
       * ```
       *
       * @returns The active segment or subsegment in the current scope. Will log a warning and return `undefined` if no segment is found.
       */
      getSegment() {
        if (!this.isTracingEnabled()) {
          return new aws_xray_sdk_core_1.Subsegment("## Dummy segment");
        }
        const segment = this.provider.getSegment();
        if (segment === void 0) {
          console.warn("Failed to get the current sub/segment from the context, this is likely because you are not using the Tracer in a Lambda function.");
        }
        return segment;
      }
      /**
       * Get the current value of the AWS X-Ray Sampled flag.
       *
       * Utility method that returns the current AWS X-Ray Sampled flag.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-concepts.html#xray-concepts-traces
       *
       * @returns boolean - `true` if the trace is sampled, `false` if tracing is disabled or the trace is not sampled.
       */
      isTraceSampled() {
        if (!this.isTracingEnabled())
          return false;
        return this.envVarsService.getXrayTraceSampled();
      }
      /**
       * Get the current value of the `tracingEnabled` property.
       *
       * You can use this method during manual instrumentation to determine
       * if tracer is currently enabled.
       *
       * @returns tracingEnabled - `true` if tracing is enabled, `false` otherwise.
       */
      isTracingEnabled() {
        return this.tracingEnabled;
      }
      /**
       * Adds annotation to existing segment or subsegment.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-segment.html#xray-sdk-nodejs-segment-annotations
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   tracer.putAnnotation('successfulBooking', true);
       * }
       * ```
       *
       * @param key - Annotation key
       * @param value - Value for annotation
       */
      putAnnotation(key, value) {
        if (!this.isTracingEnabled())
          return;
        this.provider.putAnnotation(key, value);
      }
      /**
       * Adds metadata to existing segment or subsegment.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-segment.html#xray-sdk-nodejs-segment-metadata
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   const res = someLogic();
       *   tracer.putMetadata('paymentResponse', res);
       * }
       * ```
       *
       * @param key - Metadata key
       * @param value - Value for metadata
       * @param namespace - Namespace that metadata will lie under, if none is passed it will use the serviceName
       */
      putMetadata(key, value, namespace) {
        if (!this.isTracingEnabled())
          return;
        this.provider.putMetadata(key, value, namespace || this.serviceName);
      }
      /**
       * Sets the passed subsegment as the current active subsegment.
       *
       * If you are using a middleware or a decorator this is done automatically for you.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-subsegments.html
       *
       * @example
       * ```typescript
       * import { Tracer } from '@aws-lambda-powertools/tracer';
       * import { Subsegment } from 'aws-xray-sdk-core';
       *
       * const tracer = new Tracer({ serviceName: 'serverlessAirline' });
       *
       * export const handler = async (_event: unknown, _context: unknown) => {
       *   const subsegment = new Subsegment('### foo.bar');
       *   tracer.setSegment(subsegment);
       * }
       * ```
       *
       * @param segment - Subsegment to set as the current segment
       */
      setSegment(segment) {
        if (!this.isTracingEnabled())
          return;
        return this.provider.setSegment(segment);
      }
      /**
       * Getter for `customConfigService`.
       * Used internally during initialization.
       */
      getCustomConfigService() {
        return this.customConfigService;
      }
      /**
       * Getter for `envVarsService`.
       * Used internally during initialization.
       */
      getEnvVarsService() {
        return this.envVarsService;
      }
      /**
       * Determine if we are running inside an Amplify CLI process.
       * Used internally during initialization.
       */
      isAmplifyCli() {
        return this.getEnvVarsService().getAwsExecutionEnv() === "AWS_Lambda_amplify-mock";
      }
      /**
       * Determine if we are running in a Lambda execution environment.
       * Used internally during initialization.
       */
      isLambdaExecutionEnv() {
        return this.getEnvVarsService().getAwsExecutionEnv() !== "";
      }
      /**
       * Determine if we are running inside a SAM CLI process.
       * Used internally during initialization.
       */
      isLambdaSamCli() {
        return this.getEnvVarsService().getSamLocal() !== "";
      }
      /**
       * Setter for `captureError` based on configuration passed and environment variables.
       * Used internally during initialization.
       */
      setCaptureError() {
        const customConfigValue = this.getCustomConfigService()?.getTracingCaptureError();
        if (customConfigValue !== void 0 && customConfigValue.toLowerCase() === "false") {
          this.captureError = false;
          return;
        }
        const envVarsValue = this.getEnvVarsService().getTracingCaptureError();
        if (envVarsValue.toLowerCase() === "false") {
          this.captureError = false;
          return;
        }
      }
      /**
       * Patch all HTTP(s) clients and create traces when your application makes calls outgoing calls.
       *
       * Calls using third-party HTTP request libraries, such as Axios, are supported as long as they use the native http
       * module under the hood. Support for third-party HTTP request libraries is provided on a best effort basis.
       *
       * @see https://docs.aws.amazon.com/xray/latest/devguide/xray-sdk-nodejs-httpclients.html
       *
       * @param enabled - Whether or not to patch all HTTP clients
       * @returns void
       */
      setCaptureHTTPsRequests(enabled) {
        if (enabled !== void 0 && !enabled) {
          this.captureHTTPsRequests = false;
          return;
        }
        const customConfigValue = this.getCustomConfigService()?.getCaptureHTTPsRequests();
        if (customConfigValue !== void 0 && customConfigValue.toLowerCase() === "false") {
          this.captureHTTPsRequests = false;
          return;
        }
        const envVarsValue = this.getEnvVarsService().getCaptureHTTPsRequests();
        if (envVarsValue.toLowerCase() === "false") {
          this.captureHTTPsRequests = false;
          return;
        }
      }
      /**
       * Setter for `captureResponse` based on configuration passed and environment variables.
       * Used internally during initialization.
       */
      setCaptureResponse() {
        const customConfigValue = this.getCustomConfigService()?.getTracingCaptureResponse();
        if (customConfigValue !== void 0 && customConfigValue.toLowerCase() === "false") {
          this.captureResponse = false;
          return;
        }
        const envVarsValue = this.getEnvVarsService().getTracingCaptureResponse();
        if (envVarsValue.toLowerCase() === "false") {
          this.captureResponse = false;
          return;
        }
      }
      /**
       * Setter for `customConfigService` based on configuration passed.
       * Used internally during initialization.
       *
       * @param customConfigService - Custom configuration service to use
       */
      setCustomConfigService(customConfigService) {
        this.customConfigService = customConfigService ? customConfigService : void 0;
      }
      /**
       * Setter and initializer for `envVarsService`.
       * Used internally during initialization.
       */
      setEnvVarsService() {
        this.envVarsService = new config_1.EnvironmentVariablesService();
      }
      /**
       * Method that reconciles the configuration passed with the environment variables.
       * Used internally during initialization.
       *
       * @param options - Configuration passed to the tracer
       */
      setOptions(options) {
        const { enabled, serviceName, captureHTTPsRequests, customConfigService } = options;
        this.setEnvVarsService();
        this.setCustomConfigService(customConfigService);
        this.setTracingEnabled(enabled);
        this.setCaptureResponse();
        this.setCaptureError();
        this.setServiceName(serviceName);
        this.setCaptureHTTPsRequests(captureHTTPsRequests);
        return this;
      }
      /**
       * Setter for `customConfigService` based on configurations passed and environment variables.
       * Used internally during initialization.
       *
       * @param serviceName - Name of the service to use
       */
      setServiceName(serviceName) {
        if (serviceName !== void 0 && this.isValidServiceName(serviceName)) {
          this.serviceName = serviceName;
          return;
        }
        const customConfigValue = this.getCustomConfigService()?.getServiceName();
        if (customConfigValue !== void 0 && this.isValidServiceName(customConfigValue)) {
          this.serviceName = customConfigValue;
          return;
        }
        const envVarsValue = this.getEnvVarsService().getServiceName();
        if (envVarsValue !== void 0 && this.isValidServiceName(envVarsValue)) {
          this.serviceName = envVarsValue;
          return;
        }
        this.serviceName = this.getDefaultServiceName();
      }
      /**
       * Setter for `tracingEnabled` based on configurations passed and environment variables.
       * Used internally during initialization.
       *
       * @param enabled - Whether or not tracing is enabled
       */
      setTracingEnabled(enabled) {
        if (enabled !== void 0 && !enabled) {
          this.tracingEnabled = enabled;
          return;
        }
        const customConfigValue = this.getCustomConfigService()?.getTracingEnabled();
        if (customConfigValue !== void 0 && customConfigValue.toLowerCase() === "false") {
          this.tracingEnabled = false;
          return;
        }
        const envVarsValue = this.getEnvVarsService().getTracingEnabled();
        if (envVarsValue.toLowerCase() === "false") {
          this.tracingEnabled = false;
          return;
        }
        if (this.isAmplifyCli() || this.isLambdaSamCli() || !this.isLambdaExecutionEnv()) {
          this.tracingEnabled = false;
        }
      }
    };
    exports.Tracer = Tracer2;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/TracerInterface.js
var require_TracerInterface = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/TracerInterface.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/middleware/middy.js
var require_middy4 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/middleware/middy.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.captureLambdaHandler = void 0;
    var middleware_1 = require_middleware();
    var captureLambdaHandler = (target, options) => {
      let lambdaSegment;
      let handlerSegment;
      const setCleanupFunction = (request) => {
        request.internal = {
          ...request.internal,
          [middleware_1.TRACER_KEY]: close
        };
      };
      const open = () => {
        const segment = target.getSegment();
        if (segment === void 0) {
          return;
        }
        lambdaSegment = segment;
        handlerSegment = lambdaSegment.addNewSubsegment(`## ${process.env._HANDLER}`);
        target.setSegment(handlerSegment);
      };
      const close = () => {
        if (handlerSegment === void 0 || lambdaSegment === null) {
          return;
        }
        try {
          handlerSegment.close();
        } catch (error) {
          console.warn(`Failed to close or serialize segment %s. We are catching the error but data might be lost.`, handlerSegment.name, error);
        }
        target.setSegment(lambdaSegment);
      };
      const captureLambdaHandlerBefore = async (request) => {
        if (target.isTracingEnabled()) {
          open();
          setCleanupFunction(request);
          target.annotateColdStart();
          target.addServiceNameAnnotation();
        }
      };
      const captureLambdaHandlerAfter = async (request) => {
        if (target.isTracingEnabled()) {
          if (options?.captureResponse ?? true) {
            target.addResponseAsMetadata(request.response, process.env._HANDLER);
          }
          close();
        }
      };
      const captureLambdaHandlerError = async (request) => {
        if (target.isTracingEnabled()) {
          target.addErrorAsMetadata(request.error);
          close();
        }
      };
      return {
        before: captureLambdaHandlerBefore,
        after: captureLambdaHandlerAfter,
        onError: captureLambdaHandlerError
      };
    };
    exports.captureLambdaHandler = captureLambdaHandler;
  }
});

// ../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/index.js
var require_lib5 = __commonJS({
  "../node_modules/.pnpm/@aws-lambda-powertools+tracer@1.17.0/node_modules/@aws-lambda-powertools/tracer/lib/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_helpers2(), exports);
    __exportStar(require_Tracer(), exports);
    __exportStar(require_TracerInterface(), exports);
    __exportStar(require_middy4(), exports);
  }
});

// src/contracts_service/contractEventHandler.ts
var contractEventHandler_exports = {};
__export(contractEventHandler_exports, {
  lambdaHandler: () => lambdaHandler,
  myFunction: () => myFunction
});
module.exports = __toCommonJS(contractEventHandler_exports);
var import_util_dynamodb = require("@aws-sdk/util-dynamodb");
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_crypto = require("crypto");
var import_metrics2 = __toESM(require_lib2());

// src/contracts_service/powertools.ts
var import_metrics = __toESM(require_lib2());
var import_logger = __toESM(require_lib3());
var import_tracer = __toESM(require_lib5());
var SERVICE_NAMESPACE = process.env.SERVICE_NAMESPACE ?? "test_namespace";
var defaultValues = {
  region: process.env.AWS_REGION || "N/A",
  executionEnv: process.env.AWS_EXECUTION_ENV || "N/A"
};
var logger = new import_logger.Logger({
  logLevel: process.env.LOG_LEVEL || "INFO",
  persistentLogAttributes: {
    ...defaultValues,
    logger: {
      name: "@aws-lambda-powertools/logger"
    }
  }
});
var metrics = new import_metrics.Metrics({
  defaultDimensions: defaultValues,
  namespace: SERVICE_NAMESPACE
});
var tracer = new import_tracer.Tracer();

// src/contracts_service/contractEventHandler.ts
var ddbClient = new import_client_dynamodb.DynamoDBClient({});
var DDB_TABLE = process.env.DYNAMODB_TABLE;
var ContractEventHandlerFunction = class {
  async handler(event, context) {
    for (const sqsRecord of event.Records) {
      const contract = this.parseRecord(sqsRecord);
      switch (sqsRecord.messageAttributes.HttpMethod.stringValue) {
        case "POST":
          logger.info("Creating a contract", { contract });
          try {
            await this.createContract(contract);
            tracer.putMetadata("ContractStatus", contract);
          } catch (error) {
            tracer.addErrorAsMetadata(error);
            logger.error("Error during DDB PUT", error);
            throw error;
          }
          break;
        case "PUT":
          logger.info("Updating a contract", { contract });
          try {
            await this.updateContract(contract);
            tracer.putMetadata("ContractStatus", contract);
          } catch (error) {
            tracer.addErrorAsMetadata(error);
            logger.error("Error during DDB UPDATE", error);
            throw error;
          }
          break;
        default:
          tracer.addErrorAsMetadata(Error("Request not supported"));
          logger.error("Error request not supported");
      }
    }
  }
  async createContract(contract) {
    tracer.putAnnotation("property_id", contract.property_id);
    logger.info("Constructing DB Entry from contract", { contract });
    const createDate = /* @__PURE__ */ new Date();
    const contractId = (0, import_crypto.randomUUID)();
    const dbEntry = {
      property_id: contract["property_id"],
      contract_created: createDate.toISOString(),
      contract_last_modified_on: createDate.toISOString(),
      contract_id: contractId,
      address: contract["address"],
      seller_name: contract["seller_name"],
      contract_status: "DRAFT" /* DRAFT */
    };
    logger.info("Record to insert", { dbEntry });
    const ddbPutCommandInput = {
      TableName: DDB_TABLE,
      Item: (0, import_util_dynamodb.marshall)(dbEntry, { removeUndefinedValues: true }),
      ConditionExpression: "attribute_not_exists(property_id) OR attribute_exists(contract_status) AND contract_status IN (:CANCELLED, :CLOSED, :EXPIRED)",
      ExpressionAttributeValues: {
        ":CANCELLED": { S: "CANCELLED" /* CANCELLED */ },
        ":CLOSED": { S: "CLOSED" /* CLOSED */ },
        ":EXPIRED": { S: "EXPIRED" /* EXPIRED */ }
      }
    };
    const ddbPutCommand = new import_client_dynamodb.PutItemCommand(ddbPutCommandInput);
    const ddbPutCommandOutput = await ddbClient.send(
      ddbPutCommand
    );
    if (ddbPutCommandOutput.$metadata.httpStatusCode != 200) {
      let error = {
        propertyId: dbEntry.property_id,
        name: "ContractDBSaveError",
        message: "Response error code: " + ddbPutCommandOutput.$metadata.httpStatusCode,
        object: ddbPutCommandOutput.$metadata
      };
      throw error;
    }
    logger.info("Inserted record for contract", {
      contractId,
      metadata: ddbPutCommandOutput.$metadata
    });
    metrics.addMetric("ContractCreated", import_metrics2.MetricUnits.Count, 1);
  }
  async updateContract(contract) {
    const modifiedDate = /* @__PURE__ */ new Date();
    const dbEntry = {
      contract_id: contract.contract_id,
      property_id: contract.property_id,
      contract_status: "APPROVED" /* APPROVED */,
      contract_last_modified_on: modifiedDate.toISOString()
    };
    logger.info("Record to update", { dbEntry });
    const ddbUpdateCommandInput = {
      TableName: DDB_TABLE,
      Key: { property_id: { S: dbEntry.property_id } },
      UpdateExpression: "set contract_status = :t, modified_date = :m",
      ConditionExpression: "attribute_exists(property_id) AND contract_status = :DRAFT",
      ExpressionAttributeValues: {
        ":t": { S: dbEntry.contract_status },
        ":m": { S: dbEntry.contract_last_modified_on },
        ":DRAFT": { S: "DRAFT" /* DRAFT */ }
      }
    };
    const ddbUpdateCommand = new import_client_dynamodb.UpdateItemCommand(ddbUpdateCommandInput);
    const ddbUpdateCommandOutput = await ddbClient.send(
      ddbUpdateCommand
    );
    if (ddbUpdateCommandOutput.$metadata.httpStatusCode != 200) {
      const error = {
        propertyId: dbEntry.property_id,
        name: "ContractDBUpdateError",
        message: "Response error code: " + ddbUpdateCommandOutput.$metadata.httpStatusCode,
        object: ddbUpdateCommandOutput.$metadata
      };
      throw error;
    }
    logger.info("Updated record for contract", {
      contractId: dbEntry.contract_id,
      metdata: ddbUpdateCommandOutput.$metadata
    });
    metrics.addMetric("ContractUpdated", import_metrics2.MetricUnits.Count, 1);
  }
  /**
   * Parses an SQS record into ContractDBType
   * 
   * @private
   * @method validateRecord
   * @param {SQSRecord} record - The SQS record containing the contract.
   * @returns {ContractDBType} - The contract from the SQS record
   */
  parseRecord(record) {
    let contract;
    try {
      contract = JSON.parse(record.body);
    } catch (error) {
      tracer.addErrorAsMetadata(error);
      logger.error("Error parsing SQS Record", error);
      throw new Error("Error parsing SQS Record");
    }
    logger.info("Returning contract", { contract });
    return contract;
  }
};
__decorateClass([
  tracer.captureLambdaHandler(),
  metrics.logMetrics({ captureColdStartMetric: true, throwOnEmptyMetrics: true }),
  logger.injectLambdaContext({ logEvent: true })
], ContractEventHandlerFunction.prototype, "handler", 1);
__decorateClass([
  tracer.captureMethod()
], ContractEventHandlerFunction.prototype, "createContract", 1);
__decorateClass([
  tracer.captureMethod()
], ContractEventHandlerFunction.prototype, "updateContract", 1);
var myFunction = new ContractEventHandlerFunction();
var lambdaHandler = myFunction.handler.bind(myFunction);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  lambdaHandler,
  myFunction
});
