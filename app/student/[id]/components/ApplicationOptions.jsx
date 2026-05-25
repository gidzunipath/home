import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { supabase } from "./../../../../lib/supabase";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

const ApplicationOptions = ({
  applicationId,
  optionsToCheck,
  title = "Options",
}) => {
  const [options, setOptions] = useState(optionsToCheck || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to update options when optionsToCheck prop changes
  useEffect(() => {
    if (optionsToCheck) {
      setOptions(optionsToCheck);
    }
  }, [optionsToCheck]);

  // Effect to fetch options from Supabase when applicationId changes
  useEffect(() => {
    if (!applicationId) return;

    const fetchOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("options")
          .select("name, option")
          .eq("application_id", applicationId);

        if (error) {
          console.error("Error fetching options:", error);
          setError("Failed to fetch options. Please try again.");
          return;
        }

        // Merge fetched data with existing options
        const updatedOptions = options.map((opt) => {
          const match = data.find((dbOption) => dbOption.name === opt.name);
          return match ? { ...opt, option: match.option } : opt;
        });

        setOptions(updatedOptions);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicationId]);

  const handleCheckboxChange = async (name, checked) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("options")
        .select("id")
        .eq("application_id", applicationId)
        .eq("name", name);

      if (error) {
        console.error("Error checking existing option:", error);
        setError("Failed to update option. Please try again.");
        return;
      }

      if (data.length > 0) {
        // Update the existing option
        const { error: updateError } = await supabase
          .from("options")
          .update({ option: checked })
          .eq("id", data[0].id);

        if (updateError) {
          console.error("Error updating option:", updateError);
          setError("Failed to update option. Please try again.");
          return;
        }
      } else {
        // Insert a new option
        const { error: insertError } = await supabase.from("options").insert({
          application_id: applicationId,
          name,
          option: checked,
        });

        if (insertError) {
          console.error("Error inserting new option:", insertError);
          setError("Failed to insert new option. Please try again.");
          return;
        }
      }

      // Update the local state
      setOptions((prevOptions) =>
        prevOptions.map((opt) =>
          opt.name === name ? { ...opt, option: checked } : opt
        )
      );
    } catch (err) {
      console.error("Error handling checkbox change:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-appleGray-800 mb-2">{title}</h3>
        {loading && (
          <div className="flex items-center space-x-2 text-sky-600">
            <FaClock className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600">
            <FaExclamationTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {options.length > 0 ? (
          options.map((opt, index) => (
            <div
              key={opt.name}
              className="group bg-appleGray-50 hover:bg-white border border-appleGray-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-appleGray-800 font-medium text-sm leading-relaxed">
                    {opt.name}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  {opt.option ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-soft">
                        <FaCheck className="text-white text-sm" />
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        Complete
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-appleGray-300 rounded-full flex items-center justify-center">
                        <FaTimes className="text-appleGray-500 text-sm" />
                      </div>
                      <span className="text-sm font-medium text-appleGray-500">
                        Pending
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-appleGray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="w-6 h-6 text-appleGray-400" />
            </div>
            <p className="text-appleGray-500 font-medium">
              No options available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

ApplicationOptions.propTypes = {
  applicationId: PropTypes.string.isRequired,
  optionsToCheck: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      option: PropTypes.bool.isRequired,
    })
  ),
  title: PropTypes.string,
};

ApplicationOptions.defaultProps = {
  optionsToCheck: [],
  title: "Options",
};

export default ApplicationOptions;
