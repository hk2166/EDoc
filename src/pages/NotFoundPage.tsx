import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container-padding mx-auto max-w-2xl min-h-[80vh] flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="mb-6">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-neutral-400" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-800 mb-2">
            Page Not Found
          </h1>
          <p className="text-neutral-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2">
            <Home size={16} className="mr-2" />
            Return Home
          </Link>
          
          <Button
            variant="outline"
            as={Link}
            to="/help"
            icon={<AlertCircle size={16} />}
          >
            Get Help
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;